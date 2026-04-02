// src/modules/auth/platform-admin.guard.ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

@Injectable()
export class PlatformAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    console.log("PlatformAdminGuard req.user =", req.user); // ✅ DEBUG

    const user = req.user;
    if (!user) throw new ForbiddenException("Not authenticated");

    if (user.role !== "platform_admin") {
      throw new ForbiddenException("Platform admin only");
    }
    return true;
  }
}