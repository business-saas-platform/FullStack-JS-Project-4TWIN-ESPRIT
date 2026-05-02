import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  DataSource,
  DeepPartial,
  FindOptionsWhere,
  Repository,
} from "typeorm";
import * as bcrypt from "bcrypt";

import { RegistrationRequestEntity } from "./entities/registration-request.entity";
import { CreateRegistrationRequestDto } from "./dto/create-registration-request.dto";
import { ApproveRequestDto, RejectRequestDto } from "./dto/review-request.dto";
import { ConfirmOnlinePaymentDto } from "./dto/confirm-online-payment.dto";
import { UserEntity } from "../users/entities/user.entity";
import { BusinessEntity } from "../businesses/entities/business.entity";
import { TeamMemberEntity } from "../team-members/entities/team-member.entity";
import { MailService } from "../mail/mail.service";

import {
  PaymentMethod,
  PaymentStatus,
  RegistrationStatus,
} from "./enums/registration-request.enums";

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

    const existsUser = await this.users.findOne({
      where: { email: ownerEmail },
    });
    if (existsUser) {
      throw new ConflictException("Account already exists for this email");
    }

    const pending = await this.requests.findOne({
      where: {
        ownerEmail,
        status: RegistrationStatus.PENDING,
      },
    });

    if (pending) {
      throw new ConflictException(
        "A pending request already exists for this email"
      );
    }

    const normalizedPaymentMethod =
      dto.paymentMethod ?? PaymentMethod.MANUAL;

    const initialPaymentStatus = this.getInitialPaymentStatus(
      normalizedPaymentMethod
    );

    const req = this.requests.create({
      ownerEmail,
      ownerName: dto.ownerName.trim(),
      companyName: dto.companyName.trim(),
      companyCategory: dto.companyCategory.trim(),
      companyPhone: dto.companyPhone?.trim() || null,
      companyAddress: dto.companyAddress?.trim() || null,
      companyTaxId: dto.companyTaxId?.trim() || null,
      teamSize: dto.teamSize?.trim() || null,
      message: dto.message?.trim() || null,
      selectedPlan: dto.selectedPlan ?? null,
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: initialPaymentStatus,
      paymentProvider:
        normalizedPaymentMethod === PaymentMethod.MOCK_ONLINE
          ? "mock"
          : normalizedPaymentMethod === PaymentMethod.PAYPAL
          ? "paypal"
          : null,
      paymentReference:
        normalizedPaymentMethod === PaymentMethod.MOCK_ONLINE
          ? this.generateMockPaymentReference()
          : null,
      paymentUrl: null,
      paidAt: null,
      status: RegistrationStatus.PENDING,
      rejectionReason: null,
      reviewedByAdminId: null,
      reviewedAt: null,
    } as DeepPartial<RegistrationRequestEntity>);

    const saved = await this.requests.save(req);

    if (saved.paymentMethod === PaymentMethod.MOCK_ONLINE) {
      saved.paymentUrl = `/mock-payment/${saved.id}`;
      await this.requests.save(saved);
    }
    if (saved.paymentMethod === PaymentMethod.PAYPAL) {
      saved.paymentUrl = `/paypal-payment/${saved.id}`;
      await this.requests.save(saved);
    }

    return saved;
  }

  // =====================================================
  // LIST (ADMIN)
  // =====================================================
async list(
  status?: RegistrationStatus,
  paymentStatus?: PaymentStatus
) {
  const where: FindOptionsWhere<RegistrationRequestEntity> = {};

  if (status) {
    where.status = status;
  }

  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }

  return this.requests.find({
    where,
    order: { createdAt: "DESC" },
  });
}

  // =====================================================
  // FIND ONE (ADMIN)
  // =====================================================
  async findOne(id: string) {
    const req = await this.requests.findOne({ where: { id } });
    if (!req) throw new NotFoundException("Request not found");
    return req;
  }

  async findPublicPaymentDetails(id: string) {
    const req = await this.requests.findOne({ where: { id } });
    if (!req) throw new NotFoundException("Request not found");

    return {
      id: req.id,
      ownerName: req.ownerName,
      ownerEmail: req.ownerEmail,
      companyName: req.companyName,
      selectedPlan: req.selectedPlan,
      paymentStatus: req.paymentStatus,
      paymentMethod: req.paymentMethod,
      paymentProvider: req.paymentProvider,
      paymentReference: req.paymentReference,
      paymentUrl: req.paymentUrl,
      status: req.status,
    };
  }

  // =====================================================
  // CREATE MOCK PAYMENT
  // =====================================================
  async createMockPayment(requestId: string) {
    const req = await this.requests.findOne({ where: { id: requestId } });
    if (!req) throw new NotFoundException("Request not found");

    if (req.status !== RegistrationStatus.PENDING) {
      throw new BadRequestException(
        "Payment session can only be created for pending requests"
      );
    }

    req.paymentMethod = PaymentMethod.MOCK_ONLINE;
    req.paymentProvider = "mock";
    req.paymentStatus = PaymentStatus.PENDING;
    req.paymentReference = this.generateMockPaymentReference();
    req.paymentUrl = `/mock-payment/${req.id}`;
    req.paidAt = null;

    return this.requests.save(req);
  }

  async createPayPalPayment(requestId: string) {
    const req = await this.requests.findOne({ where: { id: requestId } });
    if (!req) throw new NotFoundException("Request not found");

    if (req.status !== RegistrationStatus.PENDING) {
      throw new BadRequestException(
        "Payment session can only be created for pending requests"
      );
    }

    req.paymentMethod = PaymentMethod.PAYPAL;
    req.paymentProvider = "paypal";
    req.paymentStatus = PaymentStatus.PENDING;
    req.paymentReference = null;
    req.paymentUrl = `/paypal-payment/${req.id}`;
    req.paidAt = null;

    return this.requests.save(req);
  }

  // =====================================================
  // MOCK PAYMENT SUCCESS
  // =====================================================
  async mockPaymentSuccess(requestId: string) {
    const req = await this.requests.findOne({ where: { id: requestId } });
    if (!req) throw new NotFoundException("Request not found");

    if (req.status !== RegistrationStatus.PENDING) {
      throw new BadRequestException("Request already reviewed");
    }

    req.paymentMethod = PaymentMethod.MOCK_ONLINE;
    req.paymentProvider = "mock";
    req.paymentStatus = PaymentStatus.PAID;
    req.paymentReference = req.paymentReference || this.generateMockPaymentReference();
    req.paymentUrl = req.paymentUrl || `/mock-payment/${req.id}`;
    req.paidAt = new Date();

    return this.requests.save(req);
  }

  // =====================================================
  // MOCK PAYMENT FAIL
  // =====================================================
  async mockPaymentFail(requestId: string) {
    const req = await this.requests.findOne({ where: { id: requestId } });
    if (!req) throw new NotFoundException("Request not found");

    if (req.status !== RegistrationStatus.PENDING) {
      throw new BadRequestException("Request already reviewed");
    }

    req.paymentMethod = PaymentMethod.MOCK_ONLINE;
    req.paymentProvider = "mock";
    req.paymentStatus = PaymentStatus.FAILED;
    req.paymentReference = req.paymentReference || this.generateMockPaymentReference();
    req.paymentUrl = req.paymentUrl || `/mock-payment/${req.id}`;
    req.paidAt = null;

    return this.requests.save(req);
  }

  // =====================================================
  // UPDATE PAYMENT STATUS (ADMIN)
  // =====================================================
  async updatePaymentStatus(
    requestId: string,
    adminUser: { id: string; role: string },
    paymentStatus: PaymentStatus,
    paymentReference?: string
  ) {
    if (adminUser.role !== "platform_admin") {
      throw new ForbiddenException("Platform admin only");
    }

    const req = await this.requests.findOne({ where: { id: requestId } });
    if (!req) throw new NotFoundException("Request not found");

    req.paymentStatus = paymentStatus;

    if (paymentReference?.trim()) {
      req.paymentReference = paymentReference.trim();
    }

    if (paymentStatus === PaymentStatus.PAID) {
      req.paidAt = new Date();
    }

    if (
      paymentStatus === PaymentStatus.UNPAID ||
      paymentStatus === PaymentStatus.FAILED ||
      paymentStatus === PaymentStatus.PENDING ||
      paymentStatus === PaymentStatus.PENDING_VERIFICATION
    ) {
      req.paidAt = null;
    }

    return this.requests.save(req);
  }

  async confirmOnlinePayment(
    requestId: string,
    payload: ConfirmOnlinePaymentDto
  ) {
    const req = await this.requests.findOne({ where: { id: requestId } });
    if (!req) throw new NotFoundException("Request not found");

    if (req.status !== RegistrationStatus.PENDING) {
      throw new BadRequestException("Request already reviewed");
    }

    const orderId = payload.orderId?.trim();
    if (!orderId) {
      throw new BadRequestException("Missing payment reference");
    }

    const captureResult = await this.capturePayPalOrder(orderId);
    const captureId =
      captureResult?.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    const capturedAmount =
      captureResult?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value;
    const capturedCurrency =
      captureResult?.purchase_units?.[0]?.payments?.captures?.[0]?.amount
        ?.currency_code;
    const captureStatus =
      captureResult?.purchase_units?.[0]?.payments?.captures?.[0]?.status;

    const expectedAmount = this.getExpectedPlanAmountUsd(req.selectedPlan);

    if (captureStatus !== "COMPLETED") {
      throw new BadRequestException("PayPal capture is not completed");
    }

    if (capturedCurrency !== "USD") {
      throw new BadRequestException("Unsupported payment currency");
    }

    if (capturedAmount !== expectedAmount) {
      throw new BadRequestException("Captured amount does not match selected plan");
    }

    req.paymentMethod = PaymentMethod.PAYPAL;
    req.paymentProvider = (payload.provider || "paypal").trim().toLowerCase();
    req.paymentStatus = PaymentStatus.PAID;
    req.paymentReference = captureId || orderId;
    req.paymentUrl = req.paymentUrl || `/paypal-payment/${req.id}`;
    req.paidAt = new Date();

    return this.requests.save(req);
  }

  private getExpectedPlanAmountUsd(plan?: string | null): string {
    const value = String(plan || "").toLowerCase();
    if (value.includes("professional") || value.includes("pro")) return "29.00";
    if (value.includes("business")) return "59.00";
    if (value.includes("enterprise")) return "99.00";
    return "10.00";
  }

  private getPayPalBaseUrl(): string {
    const mode = String(process.env.PAYPAL_MODE || "sandbox").toLowerCase();
    return mode === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";
  }

  private async getPayPalAccessToken(): Promise<string> {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new BadRequestException("PayPal server credentials are not configured");
    }

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const response = await fetch(`${this.getPayPalBaseUrl()}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new BadRequestException("Unable to authenticate with PayPal");
    }

    const data = (await response.json()) as { access_token?: string };
    if (!data.access_token) {
      throw new BadRequestException("Invalid PayPal auth response");
    }
    return data.access_token;
  }

  private async capturePayPalOrder(orderId: string): Promise<any> {
    const token = await this.getPayPalAccessToken();
    const response = await fetch(
      `${this.getPayPalBaseUrl()}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new BadRequestException(
        `PayPal capture failed: ${data?.message || "unknown error"}`
      );
    }

    return data;
  }

  // =====================================================
  // APPROVE (ADMIN)
  // =====================================================
  async approve(
    requestId: string,
    adminUser: { id: string; role: string },
    dto: ApproveRequestDto
  ) {
    if (adminUser.role !== "platform_admin") {
      throw new ForbiddenException("Platform admin only");
    }

    const req = await this.requests.findOne({ where: { id: requestId } });
    if (!req) throw new NotFoundException("Request not found");

    if (req.status !== RegistrationStatus.PENDING) {
      throw new BadRequestException("Request already reviewed");
    }

    // payment rule
    if (
      (req.paymentMethod === PaymentMethod.MOCK_ONLINE ||
        req.paymentMethod === PaymentMethod.PAYPAL) &&
      req.paymentStatus !== PaymentStatus.PAID &&
      req.paymentStatus !== PaymentStatus.WAIVED
    ) {
      throw new BadRequestException(
        "This request cannot be approved before online payment is completed"
      );
    }

    if (
      (req.paymentMethod === PaymentMethod.CASH ||
        req.paymentMethod === PaymentMethod.BANK_TRANSFER ||
        req.paymentMethod === PaymentMethod.MANUAL) &&
      req.paymentStatus !== PaymentStatus.PAID &&
      req.paymentStatus !== PaymentStatus.WAIVED
    ) {
      throw new BadRequestException(
        "This request cannot be approved before payment is confirmed by admin"
      );
    }

    const result = await this.dataSource.transaction(async (trx) => {
      const requestsRepo = trx.getRepository(RegistrationRequestEntity);
      const usersRepo = trx.getRepository(UserEntity);
      const businessesRepo = trx.getRepository(BusinessEntity);
      const teamMembersRepo = trx.getRepository(TeamMemberEntity);

      // race condition safety
      const existsUser = await usersRepo.findOne({
        where: { email: req.ownerEmail },
      });

      if (existsUser) {
        throw new ConflictException("Account already exists for this email");
      }

      const tempPassword = this.generateTempPassword();
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      const owner: UserEntity = usersRepo.create({
        email: req.ownerEmail,
        name: req.ownerName,
        role: "business_owner" as any,
        passwordHash,
        mustChangePassword: true,
        loginAttempts: 0,
        lockedUntil: null,
        permissions: ["*"],
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

      savedOwner.businessId = savedBusiness.id;
      await usersRepo.save(savedOwner);

      // optional: add owner as team member
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

      req.status = RegistrationStatus.APPROVED;
      req.reviewedByAdminId = adminUser.id;
      req.reviewedAt = new Date();

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

    return {
      ok: true,
      ownerId: result.ownerId,
      businessId: result.businessId,
    };
  }

  // =====================================================
  // REJECT (ADMIN)
  // =====================================================
  async reject(
    requestId: string,
    adminUser: { id: string; role: string },
    dto: RejectRequestDto
  ) {
    if (adminUser.role !== "platform_admin") {
      throw new ForbiddenException("Platform admin only");
    }

    const req = await this.requests.findOne({ where: { id: requestId } });
    if (!req) throw new NotFoundException("Request not found");

    if (req.status !== RegistrationStatus.PENDING) {
      throw new BadRequestException("Request already reviewed");
    }

    req.status = RegistrationStatus.REJECTED;
    req.rejectionReason = dto.reason.trim();
    req.reviewedByAdminId = adminUser.id;
    req.reviewedAt = new Date();

    await this.requests.save(req);

    await this.mail.sendOwnerRejectedEmail({
      to: req.ownerEmail,
      name: req.ownerName,
      companyName: req.companyName,
      reason: req.rejectionReason,
    });

    return { ok: true };
  }

  // =====================================================
  // HELPERS
  // =====================================================
  private getInitialPaymentStatus(paymentMethod: PaymentMethod): PaymentStatus {
    switch (paymentMethod) {
      case PaymentMethod.MOCK_ONLINE:
      case PaymentMethod.PAYPAL:
        return PaymentStatus.PENDING;

      case PaymentMethod.CASH:
      case PaymentMethod.BANK_TRANSFER:
        return PaymentStatus.PENDING_VERIFICATION;

      case PaymentMethod.MANUAL:
      default:
        return PaymentStatus.UNPAID;
    }
  }

  private generateMockPaymentReference() {
    return `MOCK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  // =====================================================
  // TEMP PASSWORD
  // =====================================================
  private generateTempPassword() {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghijkmnpqrstuvwxyz";
    const digits = "23456789";
    const special = "!@#$%";
    const all = upper + lower + digits;

    const pick = (s: string) => s[Math.floor(Math.random() * s.length)];

    return (
      pick(upper) +
      pick(lower) +
      pick(digits) +
      pick(special) +
      Array.from({ length: 6 }, () => pick(all)).join("")
    );
  }
}