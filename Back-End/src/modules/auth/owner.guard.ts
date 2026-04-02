import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) throw new ForbiddenException("Unauthenticated");
    if (user.role !== "business_owner") {
      throw new ForbiddenException("Only business owner allowed");
    }
    return true;
  }
}
