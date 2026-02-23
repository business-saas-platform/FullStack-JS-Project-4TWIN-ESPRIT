import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomUUID } from "crypto";

import { TeamMemberEntity } from "./entities/team-member.entity";
import { TeamInvitationEntity } from "./entities/team-invitation.entity";
import { BusinessEntity } from "../businesses/entities/business.entity";

import { CreateTeamMemberDto } from "./dto/create-team-member.dto";
import { UpdateTeamMemberDto } from "./dto/update-team-member.dto";
import { InviteTeamMemberDto } from "./dto/invite-team-member.dto";

// ✅ add mail service
import { MailService } from "../mail/mail.service";

type JwtUser = { sub: string; email: string; role: string };

@Injectable()
export class TeamMembersService {
  constructor(
    @InjectRepository(TeamMemberEntity) private membersRepo: Repository<TeamMemberEntity>,
    @InjectRepository(TeamInvitationEntity) private invitesRepo: Repository<TeamInvitationEntity>,
    @InjectRepository(BusinessEntity) private businessRepo: Repository<BusinessEntity>,

    // ✅ inject mail service
    private readonly mailService: MailService,
  ) {}

  // ---------- helpers ----------
  private async assertOwnerOwnsBusiness(ownerId: string, businessId: string) {
    const b = await this.businessRepo.findOne({ where: { id: businessId, ownerId } });
    if (!b) throw new ForbiddenException("You don't own this business");
    return b;
  }

  private async assertUserHasAccess(user: JwtUser, businessId: string) {
    if (user.role === "platform_admin") return true;

    if (user.role === "business_owner") {
      await this.assertOwnerOwnsBusiness(user.sub, businessId);
      return true;
    }

    const m = await this.membersRepo.findOne({
      where: { businessId, email: user.email.toLowerCase() },
    });
    if (!m) throw new ForbiddenException("No access to this business");
    return true;
  }

  // ---------- INVITE (owner-only) ----------
  async inviteForOwner(user: JwtUser, dto: InviteTeamMemberDto) {
    if (!dto.businessId) throw new BadRequestException("businessId is required");

    // ✅ get business (for business name in email)
    const business = await this.assertOwnerOwnsBusiness(user.sub, dto.businessId);

    const email = dto.email.trim().toLowerCase();

    // ✅ create invitation row
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3); // 3 days

    const invitation = this.invitesRepo.create({
      businessId: dto.businessId,
      email,
      name: dto.name.trim(),
      role: dto.role,
      permissions: dto.permissions ?? [],
      token,
      expiresAt,
      status: "pending",
    } as Partial<TeamInvitationEntity>);

    const savedInvitation = await this.invitesRepo.save(invitation);

    // ✅ upsert invited team member (so it shows in list)
    let member = await this.membersRepo.findOne({ where: { businessId: dto.businessId, email } });

    if (!member) {
      member = this.membersRepo.create({
        businessId: dto.businessId,
        name: dto.name.trim(),
        email,
        role: dto.role as any,
        status: "invited",
        permissions: dto.permissions ?? [],
        joinedAt: new Date().toISOString(),
      });
    } else {
      member.name = dto.name.trim();
      member.role = dto.role as any;
      member.status = "invited";
      member.permissions = dto.permissions ?? [];
      member.joinedAt = member.joinedAt || new Date().toISOString();
    }

    const savedMember = await this.membersRepo.save(member);

    const inviteLink =
      `${process.env.FRONTEND_URL || "http://localhost:5173"}` +
      `/auth/accept-invite?token=${encodeURIComponent(token)}`;

    // ✅ SEND EMAIL (FREE via Gmail SMTP)
    try {
      await this.mailService.sendInviteEmail({
        to: email,
        name: dto.name.trim(),
        businessName: (business as any).name || "Your Business",
        inviterEmail: user.email,
        inviteLink,
      });
    }
    catch (e: any) {
  console.log("Invite email failed:", e?.message || e);
}


    return {
      invitation: savedInvitation,
      teamMember: savedMember,
      inviteLink,
    };
  }

  // ---------- owner-only CRUD ----------
  async createForOwner(user: JwtUser, dto: CreateTeamMemberDto) {
    if (!dto.businessId) throw new BadRequestException("businessId is required");
    await this.assertOwnerOwnsBusiness(user.sub, dto.businessId);

    const email = dto.email.trim().toLowerCase();

    const exists = await this.membersRepo.findOne({ where: { businessId: dto.businessId, email } });
    if (exists) throw new BadRequestException("Member already exists for this business");

    const entity = this.membersRepo.create({
      ...dto,
      email,
      status: dto.status ?? "active",
      permissions: dto.permissions ?? [],
    });

    return this.membersRepo.save(entity);
  }

  async updateForOwner(user: JwtUser, id: string, dto: UpdateTeamMemberDto) {
    const m = await this.membersRepo.findOne({ where: { id } });
    if (!m) throw new NotFoundException("Team member not found");

    await this.assertOwnerOwnsBusiness(user.sub, m.businessId);

    Object.assign(m, dto);
    return this.membersRepo.save(m);
  }

  async removeForOwner(user: JwtUser, id: string) {
    const m = await this.membersRepo.findOne({ where: { id } });
    if (!m) throw new NotFoundException("Team member not found");

    await this.assertOwnerOwnsBusiness(user.sub, m.businessId);

    await this.membersRepo.delete({ id });
    return { deleted: true, id };
  }

  // ---------- read actions ----------
  async findAllForUser(user: JwtUser, businessId?: string) {
    if (!businessId) throw new BadRequestException("businessId query param is required");

    await this.assertUserHasAccess(user, businessId);

    return this.membersRepo.find({
      where: { businessId },
      order: { createdAt: "DESC" },
    });
  }

  async findOneForUser(user: JwtUser, id: string) {
    const m = await this.membersRepo.findOne({ where: { id } });
    if (!m) throw new NotFoundException("Team member not found");

    await this.assertUserHasAccess(user, m.businessId);
    return m;
  }
}
