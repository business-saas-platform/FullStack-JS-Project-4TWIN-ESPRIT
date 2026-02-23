import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { TenantRequest } from "../middleware/tenant.middleware";

export const BusinessId = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<TenantRequest>();
  return req.businessId;
});
