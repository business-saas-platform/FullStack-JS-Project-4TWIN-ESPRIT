import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "../../modules/users/entities/user.entity";

@Injectable()
export class PlatformAdminDbGuard implements CanActivate {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const userId = req.user?.sub;

    if (!userId) throw new ForbiddenException("Not authenticated");

    const user = await this.users.findOne({
      where: { id: userId },
    });

    if (!user || user.role !== "platform_admin") {
      throw new ForbiddenException("Platform admin only");
    }

    return true;
  }
}