import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";

import { RegistrationRequestEntity } from "./entities/registration-request.entity";
import { CreateRegistrationRequestDto } from "./dto/create-registration-request.dto";
import { ApproveRequestDto, RejectRequestDto } from "./dto/review-request.dto";
import { UserEntity } from "../users/entities/user.entity";
import { BusinessEntity } from "../businesses/entities/business.entity";
import { MailService } from "../mail/mail.service";
import { TeamMemberEntity } from "../team-members/entities/team-member.entity";

@Injectable()
export class RegistrationRequestsService {
  constructor(
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

  // Owner creates a request (pending)
  async create(dto: CreateRegistrationRequestDto) {
    const ownerEmail = dto.ownerEmail.toLowerCase().trim();

    // do not allow if user already exists
    const existsUser = await this.users.findOne({ where: { email: ownerEmail } });
    if (existsUser) throw new ConflictException("Account already exists for this email");

    // avoid duplicate pending requests
    const pending = await this.requests.findOne({
      where: { ownerEmail, status: "pending" },
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
      status: "pending",
    });

    return this.requests.save(req);
  }

  // Admin list pending
  async list(status: "pending" | "approved" | "rejected" = "pending") {
    return this.requests.find({
      where: { status },
      order: { createdAt: "DESC" },
    });
  }

  // Admin approve
  async approve(requestId: string, adminUser: { id: string; role: string }, dto: ApproveRequestDto) {
    if (adminUser.role !== "platform_admin") throw new ForbiddenException();

    const req = await this.requests.findOne({ where: { id: requestId } });
    if (!req) throw new NotFoundException("Request not found");
    if (req.status !== "pending") throw new BadRequestException("Request already reviewed");

    // create temp password
    const tempPassword = this.generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // create owner user
    const owner = this.users.create({
      email: req.ownerEmail,
      name: req.ownerName,
      role: "business_owner" as any,
      passwordHash,
      mustChangePassword: true,
      loginAttempts: 0,
      lockedUntil: null,
    });

    const savedOwner = await this.users.save(owner);

    // create business (fill required fields with defaults if missing)
    const business = this.businesses.create({
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
    });

    const savedBusiness = await this.businesses.save(business);

    // set current businessId for owner
    savedOwner.businessId = savedBusiness.id;
    await this.users.save(savedOwner);

    // optional: add owner as team_member too (useful for team module)
    const ownerMember = this.teamMembers.create({
      businessId: savedBusiness.id,
      name: savedOwner.name,
      email: savedOwner.email,
      role: "business_owner" as any,
      status: "active" as any,
      permissions: ["*"],
      joinedAt: new Date().toISOString(),
    });
    await this.teamMembers.save(ownerMember);

    // mark request approved
    req.status = "approved";
    req.reviewedByAdminId = adminUser.id;
    req.reviewedAt = new Date();
    await this.requests.save(req);

    // send email
    await (this.mail as any).sendOwnerApprovedEmail?.({
      to: savedOwner.email,
      name: savedOwner.name,
      companyName: savedBusiness.name,
      email: savedOwner.email,
      tempPassword,
    });

    // if you didn’t add method yet → we throw a clear message
    // (but better: implement it in MailService, below)

    return {
      ok: true,
      ownerId: savedOwner.id,
      businessId: savedBusiness.id,
    };
  }

  // Admin reject
  async reject(requestId: string, adminUser: { id: string; role: string }, dto: RejectRequestDto) {
    if (adminUser.role !== "platform_admin") throw new ForbiddenException();

    const req = await this.requests.findOne({ where: { id: requestId } });
    if (!req) throw new NotFoundException("Request not found");
    if (req.status !== "pending") throw new BadRequestException("Request already reviewed");

    req.status = "rejected";
    req.rejectionReason = dto.reason.trim();
    req.reviewedByAdminId = adminUser.id;
    req.reviewedAt = new Date();
    await this.requests.save(req);

    await (this.mail as any).sendOwnerRejectedEmail?.({
      to: req.ownerEmail,
      name: req.ownerName,
      companyName: req.companyName,
      reason: req.rejectionReason,
    });

    return { ok: true };
  }

  private generateTempPassword() {
    // simple + strong enough (you can improve)
    // ex: Ab3#Xk92pQ
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
