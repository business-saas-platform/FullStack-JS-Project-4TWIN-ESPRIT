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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const invoice_entity_1 = require("./entities/invoice.entity");
const invoice_item_entity_1 = require("./entities/invoice-item.entity");
let InvoicesService = class InvoicesService {
    constructor(repo, items) {
        this.repo = repo;
        this.items = items;
    }
    async create(businessId, dto) {
        const invoiceEntity = this.repo.create({ ...dto, businessId });
        const saved = await this.repo.save(invoiceEntity);
        const list = dto.items ?? [];
        if (Array.isArray(list) && list.length) {
            const itemEntities = list.map((it) => this.items.create({
                invoice: saved,
                description: it.description,
                quantity: it.quantity,
                unitPrice: it.unitPrice,
                taxRate: it.taxRate ?? 0,
                amount: it.amount ?? (it.quantity * it.unitPrice),
            }));
            await this.items.save(itemEntities);
        }
        const withItems = await this.repo.findOne({ where: { id: saved.id, businessId } });
        return this.toApi(withItems ?? saved);
    }
    async findAll(businessId) {
        const list = await this.repo.find({ where: { businessId }, order: { issueDate: "DESC" } });
        return list.map((inv) => this.toApi(inv));
    }
    async findOne(businessId, id) {
        const inv = await this.repo.findOne({ where: { id, businessId } });
        if (!inv)
            throw new common_1.NotFoundException("Invoice not found");
        return this.toApi(inv);
    }
    async update(businessId, id, dto) {
        const inv = await this.repo.findOne({ where: { id, businessId } });
        if (!inv)
            throw new common_1.NotFoundException("Invoice not found");
        Object.assign(inv, dto);
        const saved = await this.repo.save(inv);
        const updated = await this.repo.findOne({ where: { id: saved.id, businessId } });
        return this.toApi(updated ?? saved);
    }
    async remove(businessId, id) {
        const res = await this.repo.delete({ id, businessId });
        if (!res.affected)
            throw new common_1.NotFoundException("Invoice not found");
        return { deleted: true, id };
    }
    toApi(inv) {
        return {
            id: inv.id,
            businessId: inv.businessId,
            invoiceNumber: inv.invoiceNumber,
            clientId: inv.clientId,
            clientName: inv.clientName,
            issueDate: inv.issueDate,
            dueDate: inv.dueDate,
            status: inv.status,
            subtotal: inv.subtotal,
            taxAmount: inv.taxAmount,
            totalAmount: inv.totalAmount,
            paidAmount: inv.paidAmount,
            currency: inv.currency,
            notes: inv.notes,
            items: (inv.items ?? []).map((it) => ({
                id: it.id,
                description: it.description,
                quantity: it.quantity,
                unitPrice: it.unitPrice,
                taxRate: it.taxRate,
                amount: it.amount,
            })),
        };
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.InvoiceEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(invoice_item_entity_1.InvoiceItemEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map