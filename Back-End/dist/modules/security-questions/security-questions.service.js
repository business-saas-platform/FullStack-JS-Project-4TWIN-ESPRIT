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
exports.SecurityQuestionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const security_questions_entity_1 = require("./security-questions.entity");
const users_service_1 = require("../users/users.service");
const SALT_ROUNDS = 12;
let SecurityQuestionsService = class SecurityQuestionsService {
    constructor(sqRepo, usersService, jwtService) {
        this.sqRepo = sqRepo;
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async setupQuestions(userId, dto) {
        await this.sqRepo.delete({ userId });
        const entities = await Promise.all(dto.questions.map(async (item, index) => {
            const answerHash = await bcrypt.hash(item.answer.trim().toLowerCase(), SALT_ROUNDS);
            return this.sqRepo.create({
                userId,
                questionIndex: index,
                question: item.question,
                answerHash,
            });
        }));
        await this.sqRepo.save(entities);
        return { message: 'Security questions saved successfully.' };
    }
    async hasQuestions(userId) {
        const count = await this.sqRepo.count({ where: { userId } });
        return count === 3;
    }
    async getQuestionsForUser(userId) {
        const records = await this.sqRepo.find({
            where: { userId },
            order: { questionIndex: 'ASC' },
        });
        if (records.length < 3) {
            throw new common_1.NotFoundException('Security questions not set up for this user.');
        }
        return records.map((r) => r.question);
    }
    async forgotPasswordInit(dto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user) {
            return {
                message: 'If this email is registered, you will receive recovery questions.',
                questions: null,
                resetToken: null,
            };
        }
        const questions = await this.getQuestionsForUser(user.id).catch(() => null);
        if (!questions) {
            return {
                message: 'No security questions found. Please contact an admin.',
                questions: null,
                resetToken: null,
            };
        }
        const resetToken = this.jwtService.sign({ sub: user.id, stage: 'verify_questions' }, { expiresIn: '5m' });
        return { questions, resetToken };
    }
    async verifySecurityAnswers(dto) {
        let payload;
        try {
            payload = this.jwtService.verify(dto.resetToken);
        }
        catch {
            throw new common_1.UnauthorizedException('Reset token expired or invalid.');
        }
        if (payload.stage !== 'verify_questions') {
            throw new common_1.UnauthorizedException('Invalid token stage.');
        }
        const records = await this.sqRepo.find({
            where: { userId: payload.sub },
            order: { questionIndex: 'ASC' },
        });
        if (records.length < 3) {
            throw new common_1.NotFoundException('Security questions not found.');
        }
        const results = await Promise.all(records.map((record, i) => {
            const submitted = dto.answers[i]?.answer?.trim().toLowerCase() ?? '';
            return bcrypt.compare(submitted, record.answerHash);
        }));
        if (!results.every(Boolean)) {
            throw new common_1.UnauthorizedException('One or more answers are incorrect.');
        }
        const verifiedToken = this.jwtService.sign({ sub: payload.sub, stage: 'reset_password' }, { expiresIn: '10m' });
        return { verifiedToken, message: 'Answers verified. You may now reset your password.' };
    }
    async resetPassword(dto) {
        let payload;
        try {
            payload = this.jwtService.verify(dto.resetToken);
        }
        catch {
            throw new common_1.UnauthorizedException('Reset token expired or invalid.');
        }
        if (payload.stage !== 'reset_password') {
            throw new common_1.UnauthorizedException('Invalid token stage.');
        }
        await this.usersService.updatePassword(payload.sub, dto.newPassword);
        return { message: 'Password reset successfully. Please log in.' };
    }
};
exports.SecurityQuestionsService = SecurityQuestionsService;
exports.SecurityQuestionsService = SecurityQuestionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(security_questions_entity_1.SecurityQuestion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService,
        jwt_1.JwtService])
], SecurityQuestionsService);
//# sourceMappingURL=security-questions.service.js.map