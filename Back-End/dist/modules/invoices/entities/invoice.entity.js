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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceEntity = void 0;
const typeorm_1 = require("typeorm");
const invoice_item_entity_1 = require("./invoice-item.entity");
let InvoiceEntity = class InvoiceEntity {
};
exports.InvoiceEntity = InvoiceEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], InvoiceEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], InvoiceEntity.prototype, "invoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: "uuid" }),
    __metadata("design:type", String)
], InvoiceEntity.prototype, "businessId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: "uuid" }),
    __metadata("design:type", String)
], InvoiceEntity.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], InvoiceEntity.prototype, "clientName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], InvoiceEntity.prototype, "issueDate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], InvoiceEntity.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: ["draft", "sent", "viewed", "paid", "overdue", "cancelled"], default: "draft" }),
    __metadata("design:type", String)
], InvoiceEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "double precision", default: 0 }),
    __metadata("design:type", Number)
], InvoiceEntity.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "double precision", default: 0 }),
    __metadata("design:type", Number)
], InvoiceEntity.prototype, "taxAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "double precision", default: 0 }),
    __metadata("design:type", Number)
], InvoiceEntity.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "double precision", default: 0 }),
    __metadata("design:type", Number)
], InvoiceEntity.prototype, "paidAmount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], InvoiceEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], InvoiceEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => invoice_item_entity_1.InvoiceItemEntity, (it) => it.invoice, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], InvoiceEntity.prototype, "items", void 0);
exports.InvoiceEntity = InvoiceEntity = __decorate([
    (0, typeorm_1.Entity)("invoices")
], InvoiceEntity);
//# sourceMappingURL=invoice.entity.js.map