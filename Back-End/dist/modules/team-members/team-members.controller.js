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
exports.TeamMembersController = void 0;
const common_1 = require("@nestjs/common");
const team_members_service_1 = require("./team-members.service");
const create_team_member_dto_1 = require("./dto/create-team-member.dto");
const update_team_member_dto_1 = require("./dto/update-team-member.dto");
const invite_team_member_dto_1 = require("./dto/invite-team-member.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const owner_guard_1 = require("../auth/owner.guard");
const business_id_decorator_1 = require("../../common/decorators/business-id.decorator");
let TeamMembersController = class TeamMembersController {
    constructor(s) {
        this.s = s;
    }
    invite(req, dto) {
        return this.s.inviteForOwner(req.user, dto);
    }
    create(req, dto) {
        return this.s.createForOwner(req.user, dto);
    }
    findAll(req, businessId) {
        return this.s.findAllForUser(req.user, businessId);
    }
    findOne(req, id) {
        return this.s.findOneForUser(req.user, id);
    }
    update(req, id, dto) {
        return this.s.updateForOwner(req.user, id, dto);
    }
    remove(req, id) {
        return this.s.removeForOwner(req.user, id);
    }
};
exports.TeamMembersController = TeamMembersController;
__decorate([
    (0, common_1.UseGuards)(owner_guard_1.OwnerGuard),
    (0, common_1.Post)("invite"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, invite_team_member_dto_1.InviteTeamMemberDto]),
    __metadata("design:returntype", void 0)
], TeamMembersController.prototype, "invite", null);
__decorate([
    (0, common_1.UseGuards)(owner_guard_1.OwnerGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_team_member_dto_1.CreateTeamMemberDto]),
    __metadata("design:returntype", void 0)
], TeamMembersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, business_id_decorator_1.BusinessId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TeamMembersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TeamMembersController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(owner_guard_1.OwnerGuard),
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_team_member_dto_1.UpdateTeamMemberDto]),
    __metadata("design:returntype", void 0)
], TeamMembersController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(owner_guard_1.OwnerGuard),
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TeamMembersController.prototype, "remove", null);
exports.TeamMembersController = TeamMembersController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("team-members"),
    __metadata("design:paramtypes", [team_members_service_1.TeamMembersService])
], TeamMembersController);
//# sourceMappingURL=team-members.controller.js.map