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
exports.TeamMembersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const team_member_entity_1 = require("./entities/team-member.entity");
const team_invitation_entity_1 = require("./entities/team-invitation.entity");
const business_entity_1 = require("../businesses/entities/business.entity");
const mail_service_1 = require("../mail/mail.service");
let TeamMembersService = class TeamMembersService {
    constructor(membersRepo, invitesRepo, businessRepo, mailService) {
        this.membersRepo = membersRepo;
        this.invitesRepo = invitesRepo;
        this.businessRepo = businessRepo;
        this.mailService = mailService;
    }
    async assertOwnerOwnsBusiness(ownerId, businessId) {
        const b = await this.businessRepo.findOne({ where: { id: businessId, ownerId } });
        if (!b)
            throw new common_1.ForbiddenException("You don't own this business");
        return b;
    }
    async assertUserHasAccess(user, businessId) {
        if (user.role === "platform_admin")
            return true;
        if (user.role === "business_owner") {
            await this.assertOwnerOwnsBusiness(user.sub, businessId);
            return true;
        }
        const m = await this.membersRepo.findOne({
            where: { businessId, email: user.email.toLowerCase() },
        });
        if (!m)
            throw new common_1.ForbiddenException("No access to this business");
        return true;
    }
    async inviteForOwner(user, dto) {
        if (!dto.businessId)
            throw new common_1.BadRequestException("businessId is required");
        const business = await this.assertOwnerOwnsBusiness(user.sub, dto.businessId);
        const email = dto.email.trim().toLowerCase();
        const token = (0, crypto_1.randomUUID)();
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3);
        const invitation = this.invitesRepo.create({
            businessId: dto.businessId,
            email,
            name: dto.name.trim(),
            role: dto.role,
            permissions: dto.permissions ?? [],
            token,
            expiresAt,
            status: "pending",
        });
        const savedInvitation = await this.invitesRepo.save(invitation);
        let member = await this.membersRepo.findOne({ where: { businessId: dto.businessId, email } });
        if (!member) {
            member = this.membersRepo.create({
                businessId: dto.businessId,
                name: dto.name.trim(),
                email,
                role: dto.role,
                status: "invited",
                permissions: dto.permissions ?? [],
                joinedAt: new Date().toISOString(),
            });
        }
        else {
            member.name = dto.name.trim();
            member.role = dto.role;
            member.status = "invited";
            member.permissions = dto.permissions ?? [];
            member.joinedAt = member.joinedAt || new Date().toISOString();
        }
        const savedMember = await this.membersRepo.save(member);
        const inviteLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}` +
            `/auth/accept-invite?token=${encodeURIComponent(token)}`;
        try {
            await this.mailService.sendInviteEmail({
                to: email,
                name: dto.name.trim(),
                businessName: business.name || "Your Business",
                inviterEmail: user.email,
                inviteLink,
            });
        }
        catch (e) {
            console.log("Invite email failed:", e?.message || e);
        }
        return {
            invitation: savedInvitation,
            teamMember: savedMember,
            inviteLink,
        };
    }
    async createForOwner(user, dto) {
        if (!dto.businessId)
            throw new common_1.BadRequestException("businessId is required");
        await this.assertOwnerOwnsBusiness(user.sub, dto.businessId);
        const email = dto.email.trim().toLowerCase();
        const exists = await this.membersRepo.findOne({ where: { businessId: dto.businessId, email } });
        if (exists)
            throw new common_1.BadRequestException("Member already exists for this business");
        const entity = this.membersRepo.create({
            ...dto,
            email,
            status: dto.status ?? "active",
            permissions: dto.permissions ?? [],
        });
        return this.membersRepo.save(entity);
    }
    async updateForOwner(user, id, dto) {
        const m = await this.membersRepo.findOne({ where: { id } });
        if (!m)
            throw new common_1.NotFoundException("Team member not found");
        await this.assertOwnerOwnsBusiness(user.sub, m.businessId);
        Object.assign(m, dto);
        return this.membersRepo.save(m);
    }
    async removeForOwner(user, id) {
        const m = await this.membersRepo.findOne({ where: { id } });
        if (!m)
            throw new common_1.NotFoundException("Team member not found");
        await this.assertOwnerOwnsBusiness(user.sub, m.businessId);
        await this.membersRepo.delete({ id });
        return { deleted: true, id };
    }
    async findAllForUser(user, businessId) {
        if (!businessId)
            throw new common_1.BadRequestException("businessId query param is required");
        await this.assertUserHasAccess(user, businessId);
        return this.membersRepo.find({
            where: { businessId },
            order: { createdAt: "DESC" },
        });
    }
    async findOneForUser(user, id) {
        const m = await this.membersRepo.findOne({ where: { id } });
        if (!m)
            throw new common_1.NotFoundException("Team member not found");
        await this.assertUserHasAccess(user, m.businessId);
        return m;
    }
};
exports.TeamMembersService = TeamMembersService;
exports.TeamMembersService = TeamMembersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(team_member_entity_1.TeamMemberEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(team_invitation_entity_1.TeamInvitationEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(business_entity_1.BusinessEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        mail_service_1.MailService])
], TeamMembersService);
//# sourceMappingURL=team-members.service.js.map