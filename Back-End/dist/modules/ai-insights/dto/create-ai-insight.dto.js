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
exports.CreateAIInsightDto = void 0;
const class_validator_1 = require("class-validator");
class CreateAIInsightDto {
}
exports.CreateAIInsightDto = CreateAIInsightDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAIInsightDto.prototype, "businessId", void 0);
__decorate([
    (0, class_validator_1.IsIn)(["prediction", "warning", "recommendation", "opportunity"]),
    __metadata("design:type", Object)
], CreateAIInsightDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsIn)(["revenue", "expenses", "clients", "cash_flow", "invoices"]),
    __metadata("design:type", Object)
], CreateAIInsightDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAIInsightDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAIInsightDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAIInsightDto.prototype, "confidence", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAIInsightDto.prototype, "actionable", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAIInsightDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(["high", "medium", "low"]),
    __metadata("design:type", Object)
], CreateAIInsightDto.prototype, "impact", void 0);
//# sourceMappingURL=create-ai-insight.dto.js.map