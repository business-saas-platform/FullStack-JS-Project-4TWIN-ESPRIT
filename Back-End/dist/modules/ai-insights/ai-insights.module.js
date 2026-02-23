"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIInsightsModule = void 0;
const common_1 = require("@nestjs/common");
const tenant_module_1 = require("../../common/tenant/tenant.module");
const typeorm_1 = require("@nestjs/typeorm");
const ai_insight_entity_1 = require("./entities/ai-insight.entity");
const ai_insights_controller_1 = require("./ai-insights.controller");
const ai_insights_service_1 = require("./ai-insights.service");
let AIInsightsModule = class AIInsightsModule {
};
exports.AIInsightsModule = AIInsightsModule;
exports.AIInsightsModule = AIInsightsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([ai_insight_entity_1.AIInsightEntity, tenant_module_1.TenantModule])],
        controllers: [ai_insights_controller_1.AIInsightsController],
        providers: [ai_insights_service_1.AIInsightsService],
    })
], AIInsightsModule);
//# sourceMappingURL=ai-insights.module.js.map