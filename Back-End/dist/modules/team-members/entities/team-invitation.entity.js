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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamInvitationEntity = void 0;
const typeorm_1 = require("typeorm");
let TeamInvitationEntity = class TeamInvitationEntity {
};
exports.TeamInvitationEntity = TeamInvitationEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], TeamInvitationEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: "uuid" }),
    __metadata("design:type", String)
], TeamInvitationEntity.prototype, "businessId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TeamInvitationEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TeamInvitationEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: ["business_admin", "accountant", "team_member"] }),
    __metadata("design:type", String)
], TeamInvitationEntity.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", array: true, default: () => "ARRAY[]::text[]" }),
    __metadata("design:type", Array)
], TeamInvitationEntity.prototype, "permissions", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TeamInvitationEntity.prototype, "token", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamptz" }),
    __metadata("design:type", Date)
], TeamInvitationEntity.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: ["pending", "accepted", "revoked"], default: "pending" }),
    __metadata("design:type", String)
], TeamInvitationEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TeamInvitationEntity.prototype, "createdAt", void 0);
exports.TeamInvitationEntity = TeamInvitationEntity = __decorate([
    (0, typeorm_1.Entity)("team_invitations")
], TeamInvitationEntity);
//# sourceMappingURL=team-invitation.entity.js.map