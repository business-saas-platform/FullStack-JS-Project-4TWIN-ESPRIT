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
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const client_entity_1 = require("./entities/client.entity");
const api_mapper_1 = require("../../common/api-mapper");
let ClientsService = class ClientsService {
    constructor(repo) {
        this.repo = repo;
    }
    async create(businessId, dto) {
        const entity = this.repo.create({
            ...dto,
            businessId,
            status: dto.status ?? "active",
            totalRevenue: 0,
            outstandingBalance: 0,
        });
        const saved = await this.repo.save(entity);
        return this.toApi(saved);
    }
    async findAll(businessId) {
        const list = await this.repo.find({
            where: { businessId },
            order: { createdAt: "DESC" },
        });
        return list.map((c) => this.toApi(c));
    }
    async findOne(businessId, id) {
        const c = await this.repo.findOne({ where: { id, businessId } });
        if (!c)
            throw new common_1.NotFoundException("Client not found");
        return this.toApi(c);
    }
    async update(businessId, id, dto) {
        const c = await this.repo.findOne({ where: { id, businessId } });
        if (!c)
            throw new common_1.NotFoundException("Client not found");
        Object.assign(c, dto);
        const saved = await this.repo.save(c);
        return this.toApi(saved);
    }
    async remove(businessId, id) {
        const res = await this.repo.delete({ id, businessId });
        if (!res.affected)
            throw new common_1.NotFoundException("Client not found");
        return { deleted: true, id };
    }
    toApi(c) {
        return {
            id: c.id,
            businessId: c.businessId,
            name: c.name,
            email: c.email,
            phone: c.phone,
            address: c.address,
            city: c.city,
            postalCode: c.postalCode,
            country: c.country,
            taxId: c.taxId,
            type: c.type,
            status: c.status,
            totalRevenue: c.totalRevenue,
            outstandingBalance: c.outstandingBalance,
            createdAt: (0, api_mapper_1.toIso)(c.createdAt),
            lastContactDate: c.lastContactDate,
            notes: c.notes,
        };
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(client_entity_1.ClientEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ClientsService);
//# sourceMappingURL=clients.service.js.map