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
exports.ForgotPasswordController = void 0;
const common_1 = require("@nestjs/common");
const security_questions_service_1 = require("./security-questions.service");
const security_questions_dto_1 = require("./security-questions.dto");
let ForgotPasswordController = class ForgotPasswordController {
    constructor(sqService) {
        this.sqService = sqService;
    }
    forgotInit(dto) {
        return this.sqService.forgotPasswordInit(dto);
    }
    forgotVerify(dto) {
        return this.sqService.verifySecurityAnswers(dto);
    }
    forgotReset(dto) {
        return this.sqService.resetPassword(dto);
    }
};
exports.ForgotPasswordController = ForgotPasswordController;
__decorate([
    (0, common_1.Post)('init'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [security_questions_dto_1.ForgotPasswordInitDto]),
    __metadata("design:returntype", void 0)
], ForgotPasswordController.prototype, "forgotInit", null);
__decorate([
    (0, common_1.Post)('verify'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [security_questions_dto_1.VerifySecurityAnswersDto]),
    __metadata("design:returntype", void 0)
], ForgotPasswordController.prototype, "forgotVerify", null);
__decorate([
    (0, common_1.Post)('reset'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [security_questions_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", void 0)
], ForgotPasswordController.prototype, "forgotReset", null);
exports.ForgotPasswordController = ForgotPasswordController = __decorate([
    (0, common_1.Controller)('auth/forgot-password'),
    __metadata("design:paramtypes", [security_questions_service_1.SecurityQuestionsService])
], ForgotPasswordController);
//# sourceMappingURL=forgot-password.controller.js.map