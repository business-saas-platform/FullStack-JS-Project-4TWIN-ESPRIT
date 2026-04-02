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
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const expense_entity_1 = require("./entities/expense.entity");
const api_mapper_1 = require("../../common/api-mapper");
let ExpensesService = class ExpensesService {
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
        return list.map((e) => this.toApi(e));
    }
    async findOne(businessId, id) {
        const e = await this.repo.findOne({ where: { id, businessId } });
        if (!e)
            throw new common_1.NotFoundException("Expense not found");
        return this.toApi(e);
    }
    async update(businessId, id, dto) {
        const e = await this.repo.findOne({ where: { id, businessId } });
        if (!e)
            throw new common_1.NotFoundException("Expense not found");
        Object.assign(e, dto);
        const saved = await this.repo.save(e);
        return this.toApi(saved);
    }
    async remove(businessId, id) {
        const res = await this.repo.delete({ id, businessId });
        if (!res.affected)
            throw new common_1.NotFoundException("Expense not found");
        return { deleted: true, id };
    }
    toApi(e) {
        return {
            id: e.id,
            businessId: e.businessId,
            date: e.date,
            amount: e.amount,
            currency: e.currency,
            category: e.category,
            vendor: e.vendor,
            description: e.description,
            paymentMethod: e.paymentMethod,
            status: e.status,
            receiptUrl: e.receiptUrl,
            submittedBy: e.submittedBy,
            approvedBy: e.approvedBy,
            createdAt: (0, api_mapper_1.toIso)(e.createdAt),
        };
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(expense_entity_1.ExpenseEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map