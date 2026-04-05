"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationController = exports.CommunicationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const channel_entity_1 = require("./channel.entity");
const message_entity_1 = require("./message.entity");
const ADMIN_ROLES = ['platform_admin', 'business_owner', 'business_admin'];
let CommunicationService = class CommunicationService {
    constructor(channels, messages) {
        this.channels = channels;
        this.messages = messages;
    }
    async getChannels(businessId, userId) {
        const all = await this.channels.find({
            where: { businessId },
            order: { createdAt: 'ASC' },
        });
        return all.filter((ch) => ch.type === 'public' ||
            ch.memberIds.includes(userId));
    }
    async createChannel(businessId, userId, role, dto) {
        if (!ADMIN_ROLES.includes(role)) {
            throw new common_1.ForbiddenException('Only admins and business owners can create channels.');
        }
        const memberIds = Array.from(new Set([userId, ...(dto.memberIds ?? [])]));
        const channel = this.channels.create({
            businessId,
            name: dto.name.trim().toLowerCase().replace(/\s+/g, '-'),
            description: dto.description,
            type: dto.type ?? 'public',
            memberIds: dto.type === 'public' ? [] : memberIds,
        });
        return this.channels.save(channel);
    }
    async seedDefaultChannels(businessId) {
        const defaults = ['general', 'announcements', 'random'];
        for (const name of defaults) {
            const exists = await this.channels.findOne({ where: { businessId, name } });
            if (!exists) {
                await this.channels.save(this.channels.create({
                    businessId,
                    name,
                    type: 'public',
                    isDefault: true,
                    memberIds: [],
                }));
            }
        }
    }
    async getMessages(businessId, channelId, userId, limit = 50, before) {
        const channel = await this.channels.findOne({
            where: { id: channelId, businessId },
        });
        if (!channel)
            throw new common_1.NotFoundException('Channel not found');
        if (channel.type !== 'public' && !channel.memberIds.includes(userId)) {
            throw new common_1.ForbiddenException('You are not a member of this channel.');
        }
        const query = this.messages
            .createQueryBuilder('m')
            .where('m.channelId = :channelId', { channelId })
            .andWhere('m.businessId = :businessId', { businessId })
            .orderBy('m.createdAt', 'DESC')
            .take(limit);
        if (before) {
            query.andWhere('m.createdAt < :before', { before: new Date(before) });
        }
        const msgs = await query.getMany();
        return msgs.reverse();
    }
    async inviteMembers(businessId, channelId, adminRole, memberIds) {
        if (!ADMIN_ROLES.includes(adminRole)) {
            throw new common_1.ForbiddenException('Only admins can invite members.');
        }
        const channel = await this.channels.findOne({
            where: { id: channelId, businessId },
        });
        if (!channel)
            throw new common_1.NotFoundException('Channel not found');
        if (channel.type === 'public') {
            throw new common_1.ForbiddenException('Public channels are open to all.');
        }
        channel.memberIds = Array.from(new Set([...channel.memberIds, ...memberIds]));
        return this.channels.save(channel);
    }
    async removeMember(businessId, channelId, adminRole, memberId) {
        if (!ADMIN_ROLES.includes(adminRole)) {
            throw new common_1.ForbiddenException('Only admins can remove members.');
        }
        const channel = await this.channels.findOne({
            where: { id: channelId, businessId },
        });
        if (!channel)
            throw new common_1.NotFoundException('Channel not found');
        channel.memberIds = channel.memberIds.filter((id) => id !== memberId);
        return this.channels.save(channel);
    }
    async deleteChannel(businessId, channelId, role) {
        if (!ADMIN_ROLES.includes(role)) {
            throw new common_1.ForbiddenException('Only admins can delete channels.');
        }
        const channel = await this.channels.findOne({
            where: { id: channelId, businessId },
        });
        if (!channel)
            throw new common_1.NotFoundException('Channel not found');
        if (channel.isDefault) {
            throw new common_1.ForbiddenException('Cannot delete default channels.');
        }
        await this.channels.delete(channelId);
        return { ok: true };
    }
};
exports.CommunicationService = CommunicationService;
exports.CommunicationService = CommunicationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(channel_entity_1.ChannelEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.MessageEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CommunicationService);
const common_2 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let CommunicationController = class CommunicationController {
    constructor(service) {
        this.service = service;
    }
    getChannels(req) {
        return this.service.getChannels(req.user.businessId, req.user.sub);
    }
    createChannel(req, dto) {
        return this.service.createChannel(req.user.businessId, req.user.sub, req.user.role, dto);
    }
    inviteMembers(req, channelId, memberIds) {
        return this.service.inviteMembers(req.user.businessId, channelId, req.user.role, memberIds);
    }
    removeMember(req, channelId, memberId) {
        return this.service.removeMember(req.user.businessId, channelId, req.user.role, memberId);
    }
    deleteChannel(req, channelId) {
        return this.service.deleteChannel(req.user.businessId, channelId, req.user.role);
    }
    getMessages(req, channelId, limit, before) {
        return this.service.getMessages(req.user.businessId, channelId, req.user.sub, limit ? parseInt(limit) : 50, before);
    }
};
exports.CommunicationController = CommunicationController;
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_2.Get)('channels'),
    __param(0, (0, common_2.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "getChannels", null);
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_2.Post)('channels'),
    __param(0, (0, common_2.Req)()),
    __param(1, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "createChannel", null);
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_2.Post)('channels/:id/invite'),
    __param(0, (0, common_2.Req)()),
    __param(1, (0, common_2.Param)('id')),
    __param(2, (0, common_2.Body)('memberIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Array]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "inviteMembers", null);
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_2.Delete)('channels/:id/members/:memberId'),
    __param(0, (0, common_2.Req)()),
    __param(1, (0, common_2.Param)('id')),
    __param(2, (0, common_2.Param)('memberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "removeMember", null);
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_2.Delete)('channels/:id'),
    __param(0, (0, common_2.Req)()),
    __param(1, (0, common_2.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "deleteChannel", null);
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_2.Get)('channels/:id/messages'),
    __param(0, (0, common_2.Req)()),
    __param(1, (0, common_2.Param)('id')),
    __param(2, (0, common_2.Query)('limit')),
    __param(3, (0, common_2.Query)('before')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "getMessages", null);
exports.CommunicationController = CommunicationController = __decorate([
    (0, common_2.Controller)('communication'),
    __metadata("design:paramtypes", [CommunicationService])
], CommunicationController);
//# sourceMappingURL=communication.service-controller.js.map