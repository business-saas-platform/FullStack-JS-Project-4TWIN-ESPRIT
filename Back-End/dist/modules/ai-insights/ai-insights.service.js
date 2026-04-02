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
exports.AIInsightsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ai_insight_entity_1 = require("./entities/ai-insight.entity");
const api_mapper_1 = require("../../common/api-mapper");
let AIInsightsService = class AIInsightsService {
    constructor(repo) {
        this.repo = repo;
    }
    async create(businessId, dto) {
        const entity = this.repo.create({ ...dto, businessId });
        const saved = await this.repo.save(entity);
        return this.toApi(saved);
    }
    async findAll(businessId) {
        const list = await this.repo.find({ where: { businessId }, order: { createdAt: "DESC" } });
        return list.map((a) => this.toApi(a));
    }
    async findOne(businessId, id) {
        const a = await this.repo.findOne({ where: { id, businessId } });
        if (!a)
            throw new common_1.NotFoundException("AI insight not found");
        return this.toApi(a);
    }
    async update(businessId, id, dto) {
        const a = await this.repo.findOne({ where: { id, businessId } });
        if (!a)
            throw new common_1.NotFoundException("AI insight not found");
        Object.assign(a, dto);
        const saved = await this.repo.save(a);
        return this.toApi(saved);
    }
    async remove(businessId, id) {
        const res = await this.repo.delete({ id, businessId });
        if (!res.affected)
            throw new common_1.NotFoundException("AI insight not found");
        return { deleted: true, id };
    }
    toApi(a) {
        return {
            id: a.id,
            businessId: a.businessId,
            type: a.type,
            category: a.category,
            title: a.title,
            description: a.description,
            confidence: a.confidence,
            actionable: a.actionable,
            action: a.action,
            impact: a.impact,
            createdAt: (0, api_mapper_1.toIso)(a.createdAt),
        };
    }
};
exports.AIInsightsService = AIInsightsService;
exports.AIInsightsService = AIInsightsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ai_insight_entity_1.AIInsightEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AIInsightsService);
//# sourceMappingURL=ai-insights.service.js.map