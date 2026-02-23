import { Module } from "@nestjs/common";
import { TenantModule } from "../../common/tenant/tenant.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AIInsightEntity } from "./entities/ai-insight.entity";
import { AIInsightsController } from "./ai-insights.controller";
import { AIInsightsService } from "./ai-insights.service";

@Module({
  imports: [TypeOrmModule.forFeature([AIInsightEntity, TenantModule])],
  controllers: [AIInsightsController],
  providers: [AIInsightsService],
})
export class AIInsightsModule {}
