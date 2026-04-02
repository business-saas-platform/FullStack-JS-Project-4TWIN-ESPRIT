import { SetMetadata } from "@nestjs/common";

export const PERMS_KEY = "required_permissions";

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMS_KEY, permissions);