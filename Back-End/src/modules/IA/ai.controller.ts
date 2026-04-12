import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { AiService } from "./ai.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { BusinessAccessGuard } from "../../common/guards/business-access.guard";
import { BusinessId } from "../../common/decorators/business-id.decorator";

@Controller("ai")
@UseGuards(JwtAuthGuard, BusinessAccessGuard)
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Get("risk/:clientId")
  getRisk(
    @BusinessId() businessId: string,
    @Param("clientId") clientId: string
  ) {
    return this.ai.predictRisk(businessId, clientId);
  }
}
