"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityQuestionsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const security_questions_entity_1 = require("./security-questions.entity");
const security_questions_service_1 = require("./security-questions.service");
const security_questions_controller_1 = require("./security-questions.controller");
const users_module_1 = require("../users/users.module");
const jwt_1 = require("@nestjs/jwt");
const forgot_password_controller_1 = require("./forgot-password.controller");
let SecurityQuestionsModule = class SecurityQuestionsModule {
};
exports.SecurityQuestionsModule = SecurityQuestionsModule;
exports.SecurityQuestionsModule = SecurityQuestionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([security_questions_entity_1.SecurityQuestion]),
            users_module_1.UsersModule,
            jwt_1.JwtModule.registerAsync({
                useFactory: () => ({
                    secret: process.env.JWT_SECRET,
                    signOptions: { expiresIn: '7d' },
                }),
            }),
        ],
        providers: [security_questions_service_1.SecurityQuestionsService],
        controllers: [security_questions_controller_1.SecurityQuestionsController, forgot_password_controller_1.ForgotPasswordController],
        exports: [security_questions_service_1.SecurityQuestionsService],
    })
], SecurityQuestionsModule);
//# sourceMappingURL=security-questions.module.js.map