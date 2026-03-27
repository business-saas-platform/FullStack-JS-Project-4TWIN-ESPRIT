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
exports.SecurityQuestionsController = void 0;
const common_1 = require("@nestjs/common");
const security_questions_service_1 = require("./security-questions.service");
const security_questions_dto_1 = require("./security-questions.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let SecurityQuestionsController = class SecurityQuestionsController {
    constructor(sqService) {
        this.sqService = sqService;
    }
    async setup(req, dto) {
        return this.sqService.setupQuestions(req.user.sub, dto);
    }
    async status(req) {
        const hasQuestions = await this.sqService.hasQuestions(req.user.sub);
        return { hasQuestions };
    }
    async forgotInit(dto) {
        return this.sqService.forgotPasswordInit(dto);
    }
    async forgotVerify(dto) {
        return this.sqService.verifySecurityAnswers(dto);
    }
    async forgotReset(dto) {
        return this.sqService.resetPassword(dto);
    }
};
exports.SecurityQuestionsController = SecurityQuestionsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('setup'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, security_questions_dto_1.SetupSecurityQuestionsDto]),
    __metadata("design:returntype", Promise)
], SecurityQuestionsController.prototype, "setup", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('status'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityQuestionsController.prototype, "status", null);
__decorate([
    (0, common_1.Post)('auth/forgot-password/init'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [security_questions_dto_1.ForgotPasswordInitDto]),
    __metadata("design:returntype", Promise)
], SecurityQuestionsController.prototype, "forgotInit", null);
__decorate([
    (0, common_1.Post)('auth/forgot-password/verify'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [security_questions_dto_1.VerifySecurityAnswersDto]),
    __metadata("design:returntype", Promise)
], SecurityQuestionsController.prototype, "forgotVerify", null);
__decorate([
    (0, common_1.Post)('auth/forgot-password/reset'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [security_questions_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], SecurityQuestionsController.prototype, "forgotReset", null);
exports.SecurityQuestionsController = SecurityQuestionsController = __decorate([
    (0, common_1.Controller)('security-questions'),
    __metadata("design:paramtypes", [security_questions_service_1.SecurityQuestionsService])
], SecurityQuestionsController);
//# sourceMappingURL=security-questions.controller.js.map