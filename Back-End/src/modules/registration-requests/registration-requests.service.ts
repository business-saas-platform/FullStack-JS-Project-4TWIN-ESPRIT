// src/modules/registration-requests/registration-requests.service.ts
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, DeepPartial, Repository } from "typeorm";
import * as bcrypt from "bcrypt";

import { RegistrationRequestEntity } from "./entities/registration-request.entity";
import { CreateRegistrationRequestDto } from "./dto/create-registration-request.dto";
import { ApproveRequestDto, RejectRequestDto } from "./dto/review-request.dto";

import { UserEntity } from "../users/entities/user.entity";
import { BusinessEntity } from "../businesses/entities/business.entity";
import { TeamMemberEntity } from "../team-members/entities/team-member.entity";
import { MailService } from "../mail/mail.service";

@Injectable()
export class RegistrationRequestsService {
  // ⚠️ خليها false إذا TeamMemberEntity.role ما فيهش business_owner
  private readonly ADD_OWNER_AS_TEAM_MEMBER = false;

  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(RegistrationRequestEntity)
    private readonly requests: Repository<RegistrationRequestEntity>,

    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,

    @InjectRepository(BusinessEntity)
    private readonly businesses: Repository<BusinessEntity>,

    @InjectRepository(TeamMemberEntity)
    private readonly teamMembers: Repository<TeamMemberEntity>,

    private readonly mail: MailService
  ) {}

  // =====================================================
  // CREATE REQUEST (PUBLIC)
  // =====================================================
  async create(dto: CreateRegistrationRequestDto) {
    const ownerEmail = dto.ownerEmail.toLowerCase().trim();

    const existsUser = await this.users.findOne({ where: { email: ownerEmail } });
    if (existsUser) throw new ConflictException("Account already exists for this email");

    const pending = await this.requests.findOne({
      where: { ownerEmail, status: "pending" as any },
    });
    if (pending) throw new ConflictException("A pending request already exists for this email");

    const req = this.requests.create({
      ownerEmail,
      ownerName: dto.ownerName.trim(),
      companyName: dto.companyName.trim(),
      companyCategory: dto.companyCategory.trim(),
      companyPhone: dto.companyPhone?.trim(),
      companyAddress: dto.companyAddress?.trim(),
      companyTaxId: dto.companyTaxId?.trim(),
      status: "pending" as any,
    } as DeepPartial<RegistrationRequestEntity>);

    return this.requests.save(req);
  }

  // =====================================================
  // LIST (ADMIN)
  // =====================================================
  async list(status: "pending" | "approved" | "rejected" = "pending") {
    return this.requests.find({
      where: { status: status as any },
      order: { createdAt: "DESC" as any },
    });
  }

  // =====================================================
  // APPROVE (ADMIN)
  // =====================================================
  async approve(
    requestId: string,
    adminUser: { id: string; role: string },
    dto: ApproveRequestDto
  ) {
    if (adminUser.role !== "platform_admin") throw new ForbiddenException("Platform admin only");

    const req = await this.requests.findOne({ where: { id: requestId } });
    if (!req) throw new NotFoundException("Request not found");
    if (req.status !== "pending") throw new BadRequestException("Request already reviewed");

    const result = await this.dataSource.transaction(async (trx) => {
      const requestsRepo = trx.getRepository(RegistrationRequestEntity);
      const usersRepo = trx.getRepository(UserEntity);
      const businessesRepo = trx.getRepository(BusinessEntity);
      const teamMembersRepo = trx.getRepository(TeamMemberEntity);

      // race condition safety
      const existsUser = await usersRepo.findOne({ where: { email: req.ownerEmail } });
      if (existsUser) throw new ConflictException("Account already exists for this email");

      const tempPassword = this.generateTempPassword();
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      // ✅ FORCE single entity types (no arrays)
      const owner: UserEntity = usersRepo.create({
        email: req.ownerEmail,
        name: req.ownerName,
        role: "business_owner" as any,
        passwordHash,
        mustChangePassword: true,
        loginAttempts: 0,
        lockedUntil: null,
        permissions: ["*"], // optional
      } as DeepPartial<UserEntity>);

      const savedOwner: UserEntity = await usersRepo.save(owner);

      const business: BusinessEntity = businessesRepo.create({
        ownerId: savedOwner.id,
        name: req.companyName,
        type: req.companyCategory,
        address: dto.address ?? req.companyAddress ?? "N/A",
        city: dto.city ?? "N/A",
        country: dto.country ?? "TN",
        taxId: dto.taxId ?? req.companyTaxId ?? "N/A",
        phone: dto.phone ?? req.companyPhone ?? "N/A",
        email: dto.email ?? req.ownerEmail,
        website: undefined,
        currency: dto.currency ?? "TND",
        fiscalYearStart: dto.fiscalYearStart ?? "01-01",
        industry: dto.industry ?? req.companyCategory,
        taxRate: 0,
      } as DeepPartial<BusinessEntity>);

      const savedBusiness: BusinessEntity = await businessesRepo.save(business);

      // attach businessId
      savedOwner.businessId = savedBusiness.id;
      await usersRepo.save(savedOwner);

     // ✅ optional: add owner as team member (ONLY if enum supports it)
if (this.ADD_OWNER_AS_TEAM_MEMBER) {
  const ownerMember = teamMembersRepo.create({
    businessId: savedBusiness.id,
    name: savedOwner.name,
    email: savedOwner.email,
    role: "business_admin" as any,
    status: "active" as any,
    permissions: ["*"],
    joinedAt: new Date(),
  } as DeepPartial<TeamMemberEntity>);

  await teamMembersRepo.save(ownerMember);
}

      // mark request approved
      req.status = "approved" as any;
      (req as any).reviewedByAdminId = adminUser.id;
      (req as any).reviewedAt = new Date();
      await requestsRepo.save(req);

      return {
        ownerId: savedOwner.id,
        ownerEmail: savedOwner.email,
        ownerName: savedOwner.name,
        businessId: savedBusiness.id,
        businessName: (savedBusiness as any).name ?? req.companyName,
        tempPassword,
      };
    });

    // send email outside transaction
    await this.mail.sendOwnerApprovedEmail({
      to: result.ownerEmail,
      name: result.ownerName,
      companyName: result.businessName,
      email: result.ownerEmail,
      tempPassword: result.tempPassword,
    });

    return { ok: true, ownerId: result.ownerId, businessId: result.businessId };
  }

  // =====================================================
  // REJECT (ADMIN)
  // =====================================================
  async reject(
    requestId: string,
    adminUser: { id: string; role: string },
    dto: RejectRequestDto
  ) {
    if (adminUser.role !== "platform_admin") throw new ForbiddenException("Platform admin only");

    const req = await this.requests.findOne({ where: { id: requestId } });
    if (!req) throw new NotFoundException("Request not found");
    if (req.status !== "pending") throw new BadRequestException("Request already reviewed");

    req.status = "rejected" as any;
    (req as any).rejectionReason = dto.reason.trim();
    (req as any).reviewedByAdminId = adminUser.id;
    (req as any).reviewedAt = new Date();

    await this.requests.save(req);

    await this.mail.sendOwnerRejectedEmail({
      to: req.ownerEmail,
      name: req.ownerName,
      companyName: req.companyName,
      reason: (req as any).rejectionReason,
    });

    return { ok: true };
  }

  // =====================================================
  // TEMP PASSWORD
  // =====================================================
  private generateTempPassword() {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghijkmnpqrstuvwxyz";
    const digits = "23456789";
    const special = "!@#$%";
    const pick = (s: string) => s[Math.floor(Math.random() * s.length)];

    return (
      pick(upper) +
      pick(lower) +
      pick(digits) +
      pick(special) +
      Array.from({ length: 6 }, () => pick(upper + lower + digits)).join("")
    );
  }
}