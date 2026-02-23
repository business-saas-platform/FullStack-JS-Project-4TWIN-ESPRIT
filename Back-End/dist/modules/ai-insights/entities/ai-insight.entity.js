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
exports.AIInsightEntity = void 0;
const typeorm_1 = require("typeorm");
let AIInsightEntity = class AIInsightEntity {
};
exports.AIInsightEntity = AIInsightEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], AIInsightEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: "uuid" }),
    __metadata("design:type", String)
], AIInsightEntity.prototype, "businessId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: ["prediction", "warning", "recommendation", "opportunity"] }),
    __metadata("design:type", String)
], AIInsightEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: ["revenue", "expenses", "clients", "cash_flow", "invoices"] }),
    __metadata("design:type", String)
], AIInsightEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AIInsightEntity.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], AIInsightEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "double precision" }),
    __metadata("design:type", Number)
], AIInsightEntity.prototype, "confidence", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], AIInsightEntity.prototype, "actionable", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AIInsightEntity.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: ["high", "medium", "low"], nullable: true }),
    __metadata("design:type", String)
], AIInsightEntity.prototype, "impact", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AIInsightEntity.prototype, "createdAt", void 0);
exports.AIInsightEntity = AIInsightEntity = __decorate([
    (0, typeorm_1.Entity)("ai_insights")
], AIInsightEntity);
//# sourceMappingURL=ai-insight.entity.js.map