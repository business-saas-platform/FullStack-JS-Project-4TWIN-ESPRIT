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
exports.BusinessAccessGuard = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const business_entity_1 = require("../../modules/businesses/entities/business.entity");
const user_entity_1 = require("../../modules/users/entities/user.entity");
let BusinessAccessGuard = class BusinessAccessGuard {
    constructor(businesses, users) {
        this.businesses = businesses;
        this.users = users;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        const businessId = req.businessId;
        if (!user)
            throw new common_1.ForbiddenException("Not authenticated");
        if (!businessId)
            throw new common_1.ForbiddenException("Missing x-business-id");
        if (user.role === "platform_admin")
            return true;
        if (user.role === "business_owner") {
            const b = await this.businesses.findOne({
                where: { id: businessId, ownerId: user.sub },
                select: { id: true },
            });
            if (!b)
                throw new common_1.ForbiddenException("No access to this business");
            return true;
        }
        const u = await this.users.findOne({
            where: { id: user.sub },
            select: { id: true, businessId: true, role: true },
        });
        if (!u || u.businessId !== businessId) {
            throw new common_1.ForbiddenException("No access to this business");
        }
        return true;
    }
};
exports.BusinessAccessGuard = BusinessAccessGuard;
exports.BusinessAccessGuard = BusinessAccessGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(business_entity_1.BusinessEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], BusinessAccessGuard);
//# sourceMappingURL=business-access.guard.js.map