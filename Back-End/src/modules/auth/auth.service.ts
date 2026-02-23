// src/modules/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";

import { UserEntity } from "../users/entities/user.entity";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { TeamInvitationEntity } from "../team-members/entities/team-invitation.entity";
import { AcceptInviteDto } from "./dto/accept-invite.dto";
import { TeamMemberEntity } from "../team-members/entities/team-member.entity";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(TeamInvitationEntity)
    private readonly invites: Repository<TeamInvitationEntity>,

    @InjectRepository(TeamMemberEntity)
    private readonly members: Repository<TeamMemberEntity>,

    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,

    private readonly jwt: JwtService
  ) {}

  // =====================================================
  // REGISTER (internal/testing OR non-approval flows)
  // =====================================================
  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();

    const exists = await this.users.findOne({ where: { email } });
    if (exists) throw new ConflictException("Email already used");

    // enforce strong password
    if (!this.isStrongPassword(dto.password)) {
      throw new BadRequestException(
        "Weak password (need 1 uppercase, 1 lowercase, 1 number, min 8)"
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.users.create({
      email,
      name: dto.name,
      role: (dto.role ?? "business_owner") as any,
      businessId: dto.businessId,
      passwordHash,
      mustChangePassword: false,
      loginAttempts: 0,
      lockedUntil: null,
    } as DeepPartial<UserEntity>);

    const saved = await this.users.save(user);
    const token = await this.sign(saved);

    return {
      access_token: token,
      user: this.toPublic(saved),
      mustChangePassword: saved.mustChangePassword,
    };
  }

  // =====================================================
  // LOGIN (3 attempts => lock 1 hour)
  // =====================================================
  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.users.findOne({ where: { email } });

    // same generic error (don’t leak)
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // locked?
    if (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) {
      throw new UnauthorizedException("Account locked. Try again later.");
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);

    if (!ok) {
      user.loginAttempts = (user.loginAttempts ?? 0) + 1;

      if (user.loginAttempts >= 3) {
        user.lockedUntil = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        user.loginAttempts = 0; // reset counter after lock
      }

      await this.users.save(user);
      throw new UnauthorizedException("Invalid credentials");
    }

    // success => reset attempts
    user.loginAttempts = 0;
    user.lockedUntil = null;
    await this.users.save(user);

    const token = await this.sign(user);

    return {
      access_token: token,
      user: this.toPublic(user),
      mustChangePassword: !!user.mustChangePassword,
    };
  }

  // =====================================================
  // ME
  // =====================================================
  async me(userId: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.toPublic(user);
  }

  // =====================================================
  // FIRST LOGIN - CHANGE PASSWORD (mustChangePassword)
  // =====================================================
  async changePasswordFirst(userId: string, newPassword: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    if (!user.mustChangePassword) {
      throw new BadRequestException("Password change not required");
    }

    if (!this.isStrongPassword(newPassword)) {
      throw new BadRequestException(
        "Weak password (need 1 uppercase, 1 lowercase, 1 number, min 8)"
      );
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;

    // also reset lock fields (safe)
    user.loginAttempts = 0;
    user.lockedUntil = null;

    const saved = await this.users.save(user);

    const token = await this.sign(saved);
    return { ok: true, access_token: token, user: this.toPublic(saved) };
  }

  // =====================================================
  // ACCEPT INVITE (kept) + password policy
  // =====================================================
  async acceptInvite(dto: AcceptInviteDto) {
    const token = (dto.token || "").trim();
    if (!token) throw new BadRequestException("Invalid invitation token");

    const inv = await this.invites.findOne({ where: { token } });
    if (!inv) throw new BadRequestException("Invalid invitation token");
    if (inv.status !== "pending")
      throw new BadRequestException("Invitation already used");
    if (new Date(inv.expiresAt).getTime() < Date.now())
      throw new BadRequestException("Invitation expired");

    const email = inv.email.toLowerCase().trim();

    const exists = await this.users.findOne({ where: { email } });
    if (exists)
      throw new ConflictException("Account already exists for this email");

    // enforce strong password (invite flow)
    if (!this.isStrongPassword(dto.password)) {
      throw new BadRequestException(
        "Weak password (need 1 uppercase, 1 lowercase, 1 number, min 8)"
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.users.create({
      email,
      name: inv.name,
      role: inv.role as any,
      passwordHash,
      businessId: inv.businessId,
      mustChangePassword: false, // invite chooses password directly
      loginAttempts: 0,
      lockedUntil: null,
    } as DeepPartial<UserEntity>);

    const savedUser = await this.users.save(user);

    let member: TeamMemberEntity | null = await this.members.findOne({
      where: { businessId: inv.businessId, email },
    });

    if (!member) {
      member = this.members.create({
        businessId: inv.businessId,
        name: inv.name,
        email,
        role: inv.role as any,
        status: "active",
        permissions: inv.permissions ?? [],
        joinedAt: new Date().toISOString(),
      } as DeepPartial<TeamMemberEntity>);
    } else {
      member.status = "active";
      member.permissions = inv.permissions ?? member.permissions ?? [];
      member.role = inv.role as any;
      member.joinedAt = member.joinedAt || new Date().toISOString();
    }

    await this.members.save(member);

    inv.status = "accepted";
    await this.invites.save(inv);

    const jwtToken = await this.sign(savedUser);
    return {
      access_token: jwtToken,
      user: this.toPublic(savedUser),
      mustChangePassword: !!savedUser.mustChangePassword,
    };
  }

  // =====================================================
  // OAUTH SUPPORT (GOOGLE + GITHUB)
  // =====================================================
  async validateOAuthUser(payload: {
    email: string;
    name: string;
    provider: string;
  }) {
    const email = payload.email?.toLowerCase().trim();
    if (!email) throw new UnauthorizedException("OAuth email not provided");

    let user = await this.users.findOne({ where: { email } });

    if (!user) {
      user = this.users.create({
        email,
        name: payload.name,
        role: "business_owner" as any,
        // ✅ laisse undefined (pas null)
        passwordHash: undefined,
        mustChangePassword: false,
        loginAttempts: 0,
        lockedUntil: null,
      } as DeepPartial<UserEntity>);

      user = await this.users.save(user);
    }

    return user;
  }

  async generateJwt(user: UserEntity) {
    return this.sign(user);
  }

  // =====================================================
  // GITHUB / OAUTH LOGIN (corrigé sans casser le reste)
  // =====================================================
  async loginWithOAuth(oauthUser: {
    provider?: "github" | "google" | string;
    providerId: string;
    username?: string;
    email?: string | null;
    avatar?: string;
    name?: string;
  }) {
    const email = oauthUser.email ? oauthUser.email.toLowerCase().trim() : null;

    // 1) chercher user par githubId (ou email)
    let user = await this.users.findOne({
      where: [
        { githubId: oauthUser.providerId } as any,
        ...(email ? [{ email } as any] : []),
      ],
    });

    // 2) créer user si pas trouvé
    if (!user) {
      user = this.users.create({
        email: email ?? undefined,
        name: oauthUser.name || oauthUser.username || "oauth_user",
        role: "business_owner" as any,
        githubId: oauthUser.providerId,
        avatar: oauthUser.avatar,
        passwordHash: undefined,
        mustChangePassword: false,
        loginAttempts: 0,
        lockedUntil: null,
      } as DeepPartial<UserEntity>);

      user = await this.users.save(user);
    } else {
      // si trouvé par email mais pas de githubId, on le lie
      if (!(user as any).githubId) {
        (user as any).githubId = oauthUser.providerId;
      }
      if (!user.avatar && oauthUser.avatar) {
        user.avatar = oauthUser.avatar as any;
      }
      user = await this.users.save(user);
    }

    // 3) générer JWT (utilise ton sign() pour garder même payload)
    const access_token = await this.sign(user);

    return { access_token, user: this.toPublic(user) };
  }

  // =====================================================
  // INTERNAL HELPERS
  // =====================================================
  private async sign(user: UserEntity) {
    return this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
      businessId: user.businessId,
    });
  }

  private toPublic(u: UserEntity) {
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      avatar: u.avatar,
      businessId: u.businessId,
      mustChangePassword: !!u.mustChangePassword,
      lockedUntil: u.lockedUntil ? new Date(u.lockedUntil).toISOString() : null,
      createdAt: u.createdAt
        ? u.createdAt.toISOString()
        : new Date().toISOString(),
    };
  }

  // password policy: 1 upper, 1 lower, 1 digit, min 8
  private isStrongPassword(pw: string) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pw);
  }
}
