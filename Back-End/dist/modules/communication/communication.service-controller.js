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
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const channel_entity_1 = require("./channel.entity");
const message_entity_1 = require("./message.entity");
const user_entity_1 = require("../users/entities/user.entity");
const ADMIN_ROLES = ['platform_admin', 'business_owner', 'business_admin'];
let CommunicationService = class CommunicationService {
    constructor(channels, messages, users) {
        this.channels = channels;
        this.messages = messages;
        this.users = users;
    }
    async getAllPlatformReclamations(role) {
        if (role !== 'platform_admin') {
            throw new common_1.ForbiddenException("Action réservée à l'administration.");
        }
        return this.channels.find({
            where: { name: 'reclamation' },
            order: { createdAt: 'DESC' },
        });
    }
    async getOrCreateReclamationChannel(businessId, userId) {
        console.log(`[Service] Vérification du canal pour Business: ${businessId}`);
        let channel = await this.channels.findOne({
            where: { businessId, name: 'reclamation' }
        });
        if (channel) {
            if (!channel.memberIds.includes(userId)) {
                channel.memberIds = Array.from(new Set([...channel.memberIds, userId]));
                channel = await this.channels.save(channel);
            }
            return channel;
        }
        const admins = await this.users.find({
            where: { businessId, role: (0, typeorm_2.In)(['business_owner', 'business_admin']) },
        });
        const memberIds = Array.from(new Set([userId, ...admins.map((a) => a.id)]));
        const newChannel = this.channels.create({
            businessId,
            name: 'reclamation',
            description: 'Support technique direct',
            type: 'private',
            memberIds,
        });
        return this.channels.save(newChannel);
    }
    async getMessages(channelId, limit = 50, before) {
        const query = this.messages
            .createQueryBuilder('m')
            .where('m.channelId = :channelId', { channelId })
            .orderBy('m.createdAt', 'DESC')
            .take(limit);
        if (before) {
            query.andWhere('m.createdAt < :before', { before: new Date(before) });
        }
        const msgs = await query.getMany();
        return msgs.reverse();
    }
    async deleteChannel(businessId, channelId, role) {
        if (!ADMIN_ROLES.includes(role))
            throw new common_1.ForbiddenException();
        const channel = await this.channels.findOne({ where: { id: channelId, businessId } });
        if (!channel)
            throw new common_1.NotFoundException('Canal introuvable');
        if (channel.isDefault)
            throw new common_1.ForbiddenException('Canal par défaut non supprimable');
        await this.channels.delete(channelId);
        return { ok: true };
    }
};
exports.CommunicationService = CommunicationService;
exports.CommunicationService = CommunicationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(channel_entity_1.ChannelEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.MessageEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CommunicationService);
let CommunicationController = class CommunicationController {
    constructor(service) {
        this.service = service;
    }
    async getAdminAll(req) {
        console.log(`[Admin] Mariem (${req.user.email}) récupère tous les tickets`);
        return this.service.getAllPlatformReclamations(req.user.role);
    }
    async getOrCreateReclamation(req) {
        console.log(`[Client] ${req.user.email} ouvre son chat support`);
        return this.service.getOrCreateReclamationChannel(req.user.businessId, req.user.sub);
    }
    async getMessages(channelId, limit, before) {
        return this.service.getMessages(channelId, limit ? parseInt(limit) : 50, before);
    }
    async deleteChannel(req, channelId) {
        return this.service.deleteChannel(req.user.businessId, channelId, req.user.role);
    }
};
exports.CommunicationController = CommunicationController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('admin/reclamations'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "getAdminAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('reclamation'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "getOrCreateReclamation", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('channels/:id/messages'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('before')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "getMessages", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('channels/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "deleteChannel", null);
exports.CommunicationController = CommunicationController = __decorate([
    (0, common_1.Controller)('communication'),
    __metadata("design:paramtypes", [CommunicationService])
], CommunicationController);
//# sourceMappingURL=communication.service-controller.js.map