import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AIInsightsService } from "./ai-insights.service";
import { CreateAIInsightDto } from "./dto/create-ai-insight.dto";
import { UpdateAIInsightDto } from "./dto/update-ai-insight.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { BusinessAccessGuard } from "../../common/guards/business-access.guard";
import { BusinessId } from "../../common/decorators/business-id.decorator";

@Controller("ai-insights")
@UseGuards(JwtAuthGuard, BusinessAccessGuard)
export class AIInsightsController {
  constructor(private readonly s: AIInsightsService) {}

  @Post()
  create(@BusinessId() businessId: string, @Body() dto: CreateAIInsightDto) {
    return this.s.create(businessId, dto);
  }

  @Get()
  findAll(@BusinessId() businessId: string) {
    return this.s.findAll(businessId);
  }

  @Get(":id")
  findOne(@BusinessId() businessId: string, @Param("id") id: string) {
    return this.s.findOne(businessId, id);
  }

  @Patch(":id")
  update(@BusinessId() businessId: string, @Param("id") id: string, @Body() dto: UpdateAIInsightDto) {
    return this.s.update(businessId, id, dto);
  }

  @Delete(":id")
  remove(@BusinessId() businessId: string, @Param("id") id: string) {
    return this.s.remove(businessId, id);
  }
}
