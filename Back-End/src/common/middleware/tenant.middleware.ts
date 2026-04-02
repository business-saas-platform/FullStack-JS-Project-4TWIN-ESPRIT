import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

export interface TenantRequest extends Request {
  businessId?: string;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: TenantRequest, _res: Response, next: NextFunction) {
    const businessId = req.header("x-business-id");
    if (businessId) req.businessId = businessId;
    next();
  }
}
