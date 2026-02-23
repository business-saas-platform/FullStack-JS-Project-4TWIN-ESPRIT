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
exports.TeamMemberEntity = void 0;
const typeorm_1 = require("typeorm");
let TeamMemberEntity = class TeamMemberEntity {
};
exports.TeamMemberEntity = TeamMemberEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], TeamMemberEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: "uuid" }),
    __metadata("design:type", String)
], TeamMemberEntity.prototype, "businessId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TeamMemberEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TeamMemberEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: ["business_owner", "business_admin", "accountant", "team_member"] }),
    __metadata("design:type", String)
], TeamMemberEntity.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TeamMemberEntity.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TeamMemberEntity.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: ["active", "inactive", "invited"], default: "active" }),
    __metadata("design:type", String)
], TeamMemberEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", array: true, default: () => "ARRAY[]::text[]" }),
    __metadata("design:type", Array)
], TeamMemberEntity.prototype, "permissions", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TeamMemberEntity.prototype, "joinedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TeamMemberEntity.prototype, "lastActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TeamMemberEntity.prototype, "createdAt", void 0);
exports.TeamMemberEntity = TeamMemberEntity = __decorate([
    (0, typeorm_1.Entity)("team_members")
], TeamMemberEntity);
//# sourceMappingURL=team-member.entity.js.map