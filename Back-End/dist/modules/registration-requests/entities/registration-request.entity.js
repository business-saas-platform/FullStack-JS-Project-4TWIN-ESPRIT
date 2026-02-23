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
exports.RegistrationRequestEntity = void 0;
const typeorm_1 = require("typeorm");
let RegistrationRequestEntity = class RegistrationRequestEntity {
};
exports.RegistrationRequestEntity = RegistrationRequestEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], RegistrationRequestEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RegistrationRequestEntity.prototype, "ownerEmail", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RegistrationRequestEntity.prototype, "ownerName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RegistrationRequestEntity.prototype, "companyName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RegistrationRequestEntity.prototype, "companyCategory", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RegistrationRequestEntity.prototype, "companyPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RegistrationRequestEntity.prototype, "companyAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RegistrationRequestEntity.prototype, "companyTaxId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: ["pending", "approved", "rejected"], default: "pending" }),
    __metadata("design:type", String)
], RegistrationRequestEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", Object)
], RegistrationRequestEntity.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", nullable: true }),
    __metadata("design:type", Object)
], RegistrationRequestEntity.prototype, "reviewedByAdminId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamptz", nullable: true }),
    __metadata("design:type", Object)
], RegistrationRequestEntity.prototype, "reviewedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RegistrationRequestEntity.prototype, "createdAt", void 0);
exports.RegistrationRequestEntity = RegistrationRequestEntity = __decorate([
    (0, typeorm_1.Entity)("registration_requests")
], RegistrationRequestEntity);
//# sourceMappingURL=registration-request.entity.js.map