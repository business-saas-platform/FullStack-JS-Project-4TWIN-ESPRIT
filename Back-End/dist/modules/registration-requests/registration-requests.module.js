"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationRequestsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const registration_request_entity_1 = require("./entities/registration-request.entity");
const registration_requests_service_1 = require("./registration-requests.service");
const registration_requests_controller_1 = require("./registration-requests.controller");
const user_entity_1 = require("../users/entities/user.entity");
const business_entity_1 = require("../businesses/entities/business.entity");
const team_member_entity_1 = require("../team-members/entities/team-member.entity");
const mail_module_1 = require("../mail/mail.module");
let RegistrationRequestsModule = class RegistrationRequestsModule {
};
exports.RegistrationRequestsModule = RegistrationRequestsModule;
exports.RegistrationRequestsModule = RegistrationRequestsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                registration_request_entity_1.RegistrationRequestEntity,
                user_entity_1.UserEntity,
                business_entity_1.BusinessEntity,
                team_member_entity_1.TeamMemberEntity,
            ]),
            mail_module_1.MailModule,
        ],
        controllers: [registration_requests_controller_1.RegistrationRequestsController],
        providers: [registration_requests_service_1.RegistrationRequestsService],
    })
], RegistrationRequestsModule);
//# sourceMappingURL=registration-requests.module.js.map