"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamMembersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const team_member_entity_1 = require("./entities/team-member.entity");
const team_members_controller_1 = require("./team-members.controller");
const team_members_service_1 = require("./team-members.service");
const business_entity_1 = require("../businesses/entities/business.entity");
const team_invitation_entity_1 = require("./entities/team-invitation.entity");
const mail_module_1 = require("../mail/mail.module");
let TeamMembersModule = class TeamMembersModule {
};
exports.TeamMembersModule = TeamMembersModule;
exports.TeamMembersModule = TeamMembersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([team_member_entity_1.TeamMemberEntity, business_entity_1.BusinessEntity, team_invitation_entity_1.TeamInvitationEntity]), mail_module_1.MailModule],
        controllers: [team_members_controller_1.TeamMembersController],
        providers: [team_members_service_1.TeamMembersService],
    })
], TeamMembersModule);
//# sourceMappingURL=team-members.module.js.map