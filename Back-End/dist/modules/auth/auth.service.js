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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const jwt_1 = require("@nestjs/jwt");
const user_entity_1 = require("../users/entities/user.entity");
const team_invitation_entity_1 = require("../team-members/entities/team-invitation.entity");
const team_member_entity_1 = require("../team-members/entities/team-member.entity");
let AuthService = class AuthService {
    constructor(invites, members, users, jwt) {
        this.invites = invites;
        this.members = members;
        this.users = users;
        this.jwt = jwt;
    }
    async register(dto) {
        const email = dto.email.toLowerCase().trim();
        const exists = await this.users.findOne({ where: { email } });
        if (exists)
            throw new common_1.ConflictException("Email already used");
        if (!this.isStrongPassword(dto.password)) {
            throw new common_1.BadRequestException("Weak password (need 1 uppercase, 1 lowercase, 1 number, min 8)");
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = this.users.create({
            email,
            name: dto.name,
            role: (dto.role ?? "business_owner"),
            businessId: dto.businessId,
            passwordHash,
            mustChangePassword: false,
            loginAttempts: 0,
            lockedUntil: null,
            permissions: ["*"],
        });
        const saved = await this.users.save(user);
        const token = await this.sign(saved);
        return {
            access_token: token,
            user: this.toPublic(saved),
            mustChangePassword: saved.mustChangePassword,
        };
    }
    async login(dto) {
        const email = dto.email.toLowerCase().trim();
        const user = await this.users.findOne({ where: { email } });
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException("Invalid credentials");
        }
        if (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) {
            throw new common_1.UnauthorizedException("Account locked. Try again later.");
        }
        const ok = await bcrypt.compare(dto.password, user.passwordHash);
        if (!ok) {
            user.loginAttempts = (user.loginAttempts ?? 0) + 1;
            if (user.loginAttempts >= 3) {
                user.lockedUntil = new Date(Date.now() + 60 * 60 * 1000);
                user.loginAttempts = 0;
            }
            await this.users.save(user);
            throw new common_1.UnauthorizedException("Invalid credentials");
        }
        user.loginAttempts = 0;
        user.lockedUntil = null;
        await this.users.save(user);
        const token = await this.sign(user);
        return {
            access_token: token,
            user: this.toPublic(user),
            mustChangePassword: !!user.mustChangePassword,
        };
    }
    async me(userId) {
        const user = await this.users.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException();
        return this.toPublic(user);
    }
    async changePasswordFirst(userId, newPassword) {
        const user = await this.users.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException();
        if (!user.mustChangePassword) {
            throw new common_1.BadRequestException("Password change not required");
        }
        if (!this.isStrongPassword(newPassword)) {
            throw new common_1.BadRequestException("Weak password (need 1 uppercase, 1 lowercase, 1 number, min 8)");
        }
        user.passwordHash = await bcrypt.hash(newPassword, 10);
        user.mustChangePassword = false;
        user.loginAttempts = 0;
        user.lockedUntil = null;
        const saved = await this.users.save(user);
        const token = await this.sign(saved);
        return { ok: true, access_token: token, user: this.toPublic(saved) };
    }
    async acceptInvite(dto) {
        const token = (dto.token || "").trim();
        if (!token)
            throw new common_1.BadRequestException("Invalid invitation token");
        const inv = await this.invites.findOne({ where: { token } });
        if (!inv)
            throw new common_1.BadRequestException("Invalid invitation token");
        if (inv.status !== "pending")
            throw new common_1.BadRequestException("Invitation already used");
        if (new Date(inv.expiresAt).getTime() < Date.now())
            throw new common_1.BadRequestException("Invitation expired");
        const email = inv.email.toLowerCase().trim();
        if (!this.isStrongPassword(dto.password)) {
            throw new common_1.BadRequestException("Weak password (need 1 uppercase, 1 lowercase, 1 number, min 8)");
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        let user = await this.users.findOne({ where: { email } });
        if (user) {
            if (user.businessId && user.businessId !== inv.businessId) {
                throw new common_1.ConflictException("This email already belongs to another business");
            }
            user.name = user.name || inv.name;
            user.passwordHash = passwordHash;
            user.businessId = inv.businessId;
            user.role = inv.role;
            user.permissions = (inv.permissions ?? user.permissions ?? []);
            user.mustChangePassword = false;
            user.loginAttempts = 0;
            user.lockedUntil = null;
            user = await this.users.save(user);
        }
        else {
            user = await this.users.save(this.users.create({
                email,
                name: inv.name,
                role: inv.role,
                passwordHash,
                businessId: inv.businessId,
                mustChangePassword: false,
                loginAttempts: 0,
                lockedUntil: null,
                permissions: inv.permissions ?? [],
            }));
        }
        let member = await this.members.findOne({
            where: { businessId: inv.businessId, email },
        });
        if (!member) {
            member = this.members.create({
                businessId: inv.businessId,
                name: inv.name,
                email,
                role: inv.role,
                status: "active",
                permissions: inv.permissions ?? [],
                joinedAt: new Date(),
            });
        }
        else {
            member.status = "active";
            member.permissions = inv.permissions ?? member.permissions ?? [];
            member.role = inv.role;
            member.joinedAt = member.joinedAt ?? new Date();
        }
        await this.members.save(member);
        inv.status = "accepted";
        await this.invites.save(inv);
        const jwtToken = await this.sign(user);
        return {
            access_token: jwtToken,
            user: this.toPublic(user),
            mustChangePassword: !!user.mustChangePassword,
        };
    }
    async validateOAuthUser(payload) {
        const email = payload.email?.toLowerCase().trim();
        if (!email)
            throw new common_1.UnauthorizedException("OAuth email not provided");
        let user = await this.users.findOne({ where: { email } });
        if (!user) {
            user = this.users.create({
                email,
                name: payload.name,
                role: "business_owner",
                passwordHash: undefined,
                mustChangePassword: false,
                loginAttempts: 0,
                lockedUntil: null,
                permissions: [],
            });
            user = await this.users.save(user);
        }
        return user;
    }
    async generateJwt(user) {
        return this.sign(user);
    }
    async loginWithOAuth(oauthUser) {
        const email = oauthUser.email ? oauthUser.email.toLowerCase().trim() : null;
        let user = await this.users.findOne({
            where: [
                { githubId: oauthUser.providerId },
                ...(email ? [{ email }] : []),
            ],
        });
        if (!user) {
            user = this.users.create({
                email: email ?? undefined,
                name: oauthUser.name || oauthUser.username || "oauth_user",
                role: "business_owner",
                githubId: oauthUser.providerId,
                avatar: oauthUser.avatar,
                passwordHash: undefined,
                mustChangePassword: false,
                loginAttempts: 0,
                lockedUntil: null,
                permissions: [],
            });
            user = await this.users.save(user);
        }
        else {
            if (!user.githubId)
                user.githubId = oauthUser.providerId;
            if (!user.avatar && oauthUser.avatar)
                user.avatar = oauthUser.avatar;
            user = await this.users.save(user);
        }
        const access_token = await this.sign(user);
        return { access_token, user: this.toPublic(user) };
    }
    async sign(user) {
        return this.jwt.signAsync({
            sub: user.id,
            email: user.email,
            role: user.role,
            businessId: user.businessId,
            permissions: user.permissions ?? [],
        });
    }
    toPublic(u) {
        return {
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role,
            avatar: u.avatar,
            businessId: u.businessId,
            permissions: u.permissions ?? [],
            mustChangePassword: !!u.mustChangePassword,
            lockedUntil: u.lockedUntil ? new Date(u.lockedUntil).toISOString() : null,
            createdAt: u.createdAt ? u.createdAt.toISOString() : new Date().toISOString(),
        };
    }
    isStrongPassword(pw) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pw);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(team_invitation_entity_1.TeamInvitationEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(team_member_entity_1.TeamMemberEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map