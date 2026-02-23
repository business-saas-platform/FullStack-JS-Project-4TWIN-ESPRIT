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
exports.RegistrationRequestsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const registration_request_entity_1 = require("./entities/registration-request.entity");
const user_entity_1 = require("../users/entities/user.entity");
const business_entity_1 = require("../businesses/entities/business.entity");
const mail_service_1 = require("../mail/mail.service");
const team_member_entity_1 = require("../team-members/entities/team-member.entity");
let RegistrationRequestsService = class RegistrationRequestsService {
    constructor(requests, users, businesses, teamMembers, mail) {
        this.requests = requests;
        this.users = users;
        this.businesses = businesses;
        this.teamMembers = teamMembers;
        this.mail = mail;
    }
    async create(dto) {
        const ownerEmail = dto.ownerEmail.toLowerCase().trim();
        const existsUser = await this.users.findOne({ where: { email: ownerEmail } });
        if (existsUser)
            throw new common_1.ConflictException("Account already exists for this email");
        const pending = await this.requests.findOne({
            where: { ownerEmail, status: "pending" },
        });
        if (pending)
            throw new common_1.ConflictException("A pending request already exists for this email");
        const req = this.requests.create({
            ownerEmail,
            ownerName: dto.ownerName.trim(),
            companyName: dto.companyName.trim(),
            companyCategory: dto.companyCategory.trim(),
            companyPhone: dto.companyPhone?.trim(),
            companyAddress: dto.companyAddress?.trim(),
            companyTaxId: dto.companyTaxId?.trim(),
            status: "pending",
        });
        return this.requests.save(req);
    }
    async list(status = "pending") {
        return this.requests.find({
            where: { status },
            order: { createdAt: "DESC" },
        });
    }
    async approve(requestId, adminUser, dto) {
        if (adminUser.role !== "platform_admin")
            throw new common_1.ForbiddenException();
        const req = await this.requests.findOne({ where: { id: requestId } });
        if (!req)
            throw new common_1.NotFoundException("Request not found");
        if (req.status !== "pending")
            throw new common_1.BadRequestException("Request already reviewed");
        const tempPassword = this.generateTempPassword();
        const passwordHash = await bcrypt.hash(tempPassword, 10);
        const owner = this.users.create({
            email: req.ownerEmail,
            name: req.ownerName,
            role: "business_owner",
            passwordHash,
            mustChangePassword: true,
            loginAttempts: 0,
            lockedUntil: null,
        });
        const savedOwner = await this.users.save(owner);
        const business = this.businesses.create({
            ownerId: savedOwner.id,
            name: req.companyName,
            type: req.companyCategory,
            address: dto.address ?? req.companyAddress ?? "N/A",
            city: dto.city ?? "N/A",
            country: dto.country ?? "TN",
            taxId: dto.taxId ?? req.companyTaxId ?? "N/A",
            phone: dto.phone ?? req.companyPhone ?? "N/A",
            email: dto.email ?? req.ownerEmail,
            website: undefined,
            currency: dto.currency ?? "TND",
            fiscalYearStart: dto.fiscalYearStart ?? "01-01",
            industry: dto.industry ?? req.companyCategory,
            taxRate: 0,
        });
        const savedBusiness = await this.businesses.save(business);
        savedOwner.businessId = savedBusiness.id;
        await this.users.save(savedOwner);
        const ownerMember = this.teamMembers.create({
            businessId: savedBusiness.id,
            name: savedOwner.name,
            email: savedOwner.email,
            role: "business_owner",
            status: "active",
            permissions: ["*"],
            joinedAt: new Date().toISOString(),
        });
        await this.teamMembers.save(ownerMember);
        req.status = "approved";
        req.reviewedByAdminId = adminUser.id;
        req.reviewedAt = new Date();
        await this.requests.save(req);
        await this.mail.sendOwnerApprovedEmail?.({
            to: savedOwner.email,
            name: savedOwner.name,
            companyName: savedBusiness.name,
            email: savedOwner.email,
            tempPassword,
        });
        return {
            ok: true,
            ownerId: savedOwner.id,
            businessId: savedBusiness.id,
        };
    }
    async reject(requestId, adminUser, dto) {
        if (adminUser.role !== "platform_admin")
            throw new common_1.ForbiddenException();
        const req = await this.requests.findOne({ where: { id: requestId } });
        if (!req)
            throw new common_1.NotFoundException("Request not found");
        if (req.status !== "pending")
            throw new common_1.BadRequestException("Request already reviewed");
        req.status = "rejected";
        req.rejectionReason = dto.reason.trim();
        req.reviewedByAdminId = adminUser.id;
        req.reviewedAt = new Date();
        await this.requests.save(req);
        await this.mail.sendOwnerRejectedEmail?.({
            to: req.ownerEmail,
            name: req.ownerName,
            companyName: req.companyName,
            reason: req.rejectionReason,
        });
        return { ok: true };
    }
    generateTempPassword() {
        const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const lower = "abcdefghijkmnpqrstuvwxyz";
        const digits = "23456789";
        const special = "!@#$%";
        const pick = (s) => s[Math.floor(Math.random() * s.length)];
        return (pick(upper) +
            pick(lower) +
            pick(digits) +
            pick(special) +
            Array.from({ length: 6 }, () => pick(upper + lower + digits)).join(""));
    }
};
exports.RegistrationRequestsService = RegistrationRequestsService;
exports.RegistrationRequestsService = RegistrationRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(registration_request_entity_1.RegistrationRequestEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(business_entity_1.BusinessEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(team_member_entity_1.TeamMemberEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        mail_service_1.MailService])
], RegistrationRequestsService);
//# sourceMappingURL=registration-requests.service.js.map