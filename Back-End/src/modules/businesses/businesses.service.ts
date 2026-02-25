import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { BusinessEntity } from "./entities/business.entity";
import { CreateBusinessDto } from "./dto/create-business.dto";
import { UpdateBusinessDto } from "./dto/update-business.dto";
import { TeamMemberEntity } from "../team-members/entities/team-member.entity";

@Injectable()
export class BusinessesService {
  constructor(
    @InjectRepository(BusinessEntity)
    private readonly repo: Repository<BusinessEntity>,

    @InjectRepository(TeamMemberEntity)
    private readonly teamMembersRepo: Repository<TeamMemberEntity>
  ) {}

  // =====================================================
  // ADMIN / GLOBAL (use with caution)
  // =====================================================
  findAll() {
    return this.repo.find({ order: { createdAt: "DESC" } });
  }
  async getByIdForUser(user: any, businessId: string) {
  const b = await this.repo.findOne({ where: { id: businessId } });
  if (!b) throw new NotFoundException("Business not found");

  if (user.role === "platform_admin") return b;

  // owner
  if (user.role === "business_owner" && b.ownerId === user.id) return b;

  // member
  const m = await this.teamMembersRepo.findOne({
    where: { businessId, email: user.email.toLowerCase() },
  });
  if (!m) throw new ForbiddenException("No access to this business");

  return b;
}
async getById(id: string) {
  const b = await this.repo.findOne({ where: { id } as any });
  if (!b) throw new NotFoundException("Business not found");
  return b;
}
  async findOne(id: string) {
    const b = await this.repo.findOne({ where: { id } });
    if (!b) throw new NotFoundException("Business not found");
    return b;
  }

  async create(dto: CreateBusinessDto) {
    const entity = this.repo.create(dto as any);
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateBusinessDto) {
    const b = await this.findOne(id);
    Object.assign(b, dto);
    return this.repo.save(b);
  }

  async remove(id: string) {
    const res = await this.repo.delete({ id });
    if (!res.affected) throw new NotFoundException("Business not found");
    return { deleted: true, id };
  }

  // =====================================================
  // OWNER SCOPED (business_owner)
  // =====================================================
  async listByOwner(ownerId: string) {
    return this.repo.find({
      where: { ownerId },
      order: { createdAt: "DESC" },
    });
  }

  async findOneForOwner(ownerId: string, id: string) {
    const b = await this.repo.findOne({ where: { id, ownerId } });
    if (!b) throw new NotFoundException("Business not found");
    return b;
  }

  async createForOwner(ownerId: string, dto: CreateBusinessDto) {
    const entity = this.repo.create({
      ...(dto as any),
      ownerId,
      // ✅ default profile complete false (si ton entity l’a)
      isProfileComplete: false,
    });
    return this.repo.save(entity);
  }

  async updateForOwner(ownerId: string, id: string, dto: UpdateBusinessDto) {
    const b = await this.findOneForOwner(ownerId, id);
    Object.assign(b, dto);
    return this.repo.save(b);
  }

  async removeForOwner(ownerId: string, id: string) {
    const b = await this.findOneForOwner(ownerId, id);
    await this.repo.remove(b);
    return { ok: true };
  }

  // =====================================================
  // COMPLETE PROFILE (logo, matricule/taxId, address...)
  // =====================================================
async completeProfile(businessId: string, ownerId: string, dto: any) {
  const b = await this.repo.findOne({ where: { id: businessId } });
  if (!b) throw new NotFoundException("Business not found");

  // ✅ owner check
  if (b.ownerId !== ownerId) {
    throw new ForbiddenException("You are not allowed to update this business");
  }

  // ✅ update fields (only if provided)
  b.logoUrl = dto.logoUrl ?? b.logoUrl;

  b.name = dto.name ?? b.name;
  b.type = dto.type ?? b.type;

  b.address = dto.address ?? b.address;
  b.city = dto.city ?? b.city;
  b.country = dto.country ?? b.country;

  b.taxId = dto.taxId ?? b.taxId;
  b.phone = dto.phone ?? b.phone;
  b.email = dto.email ?? b.email;

  b.website = dto.website ?? b.website;

  b.currency = dto.currency ?? b.currency;
  b.fiscalYearStart = dto.fiscalYearStart ?? b.fiscalYearStart;
  b.industry = dto.industry ?? b.industry;

  // ✅ taxRate must be number
  if (dto.taxRate !== undefined && dto.taxRate !== null && dto.taxRate !== "") {
    const tr = Number(dto.taxRate);
    if (!Number.isFinite(tr)) {
      throw new BadRequestException("taxRate must be a valid number");
    }
    b.taxRate = tr;
  }

  // ✅ mark profile complete
  // since in your entity many fields are NOT nullable, you can make rule stricter
  b.isProfileComplete = Boolean(b.taxId && b.address);

  return this.repo.save(b);
}
}
