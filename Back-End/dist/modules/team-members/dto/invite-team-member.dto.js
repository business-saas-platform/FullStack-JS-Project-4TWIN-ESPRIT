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
exports.InviteTeamMemberDto = void 0;
const class_validator_1 = require("class-validator");
class InviteTeamMemberDto {
}
exports.InviteTeamMemberDto = InviteTeamMemberDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], InviteTeamMemberDto.prototype, "businessId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InviteTeamMemberDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], InviteTeamMemberDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(["business_owner", "business_admin", "accountant", "team_member"]),
    __metadata("design:type", String)
], InviteTeamMemberDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], InviteTeamMemberDto.prototype, "permissions", void 0);
//# sourceMappingURL=invite-team-member.dto.js.map