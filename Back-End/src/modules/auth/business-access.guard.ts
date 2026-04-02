import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BusinessEntity } from "../../modules/businesses/entities/business.entity";
import { TeamMemberEntity } from "../../modules/team-members/entities/team-member.entity";

@Injectable()
export class BusinessAccessGuard implements CanActivate {
  constructor(
    @InjectRepository(BusinessEntity)
    private readonly businesses: Repository<BusinessEntity>,

    @InjectRepository(TeamMemberEntity)
    private readonly members: Repository<TeamMemberEntity>
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    if (!user) throw new ForbiddenException("Not authenticated");

    // ✅ platform_admin bypass
    if (user.role === "platform_admin") return true;

    // ✅ accept businessId from header OR query OR body OR params
    const businessId =
      req.headers["x-business-id"] ||
      req.query?.businessId ||
      req.body?.businessId ||
      req.params?.id;

    if (!businessId) throw new BadRequestException("businessId is required");

    req.businessId = String(businessId);

    // ✅ owner access
    if (user.role === "business_owner") {
      const b = await this.businesses.findOne({
        where: { id: req.businessId, ownerId: user.id } as any, // ✅ id
      });
      if (!b) throw new ForbiddenException("No access to this business");
      return true;
    }

    // ✅ employee access
    const member = await this.members.findOne({
      where: {
        businessId: req.businessId,
        email: String(user.email).toLowerCase(),
        status: "active" as any,
      } as any,
    });

    if (!member) throw new ForbiddenException("No access to this business");

    req.member = member;
    return true;
  }
}