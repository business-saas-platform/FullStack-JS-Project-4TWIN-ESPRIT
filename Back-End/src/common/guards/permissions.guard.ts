import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

const PERMS_KEY = "required_permissions";

function norm(p: string) {
  return String(p || "")
    .trim()
    .toLowerCase()
    .replace(":", "."); // ✅ invoices:read === invoices.read
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    const requiredRaw =
      this.reflector.getAllAndOverride<string[]>(PERMS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];

    const required = requiredRaw.map(norm).filter(Boolean);

    // no permissions required
    if (!required.length) return true;

    if (!user) throw new ForbiddenException("Not authenticated");

    // ✅ super roles
    if (user.role === "platform_admin") return true;
    if (user.role === "business_owner") return true;

    const userPermsRaw: string[] = Array.isArray(user.permissions)
      ? user.permissions
      : [];

    const userPerms = userPermsRaw.map(norm);

    // ✅ wildcard
    if (userPerms.includes("*")) return true;

    // ✅ must include all required permissions
    const ok = required.every((p) => userPerms.includes(p));
    if (!ok) throw new ForbiddenException("Missing permissions");

    return true;
  }
}