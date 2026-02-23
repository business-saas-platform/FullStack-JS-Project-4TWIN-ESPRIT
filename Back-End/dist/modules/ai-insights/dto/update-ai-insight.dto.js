"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAIInsightDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_ai_insight_dto_1 = require("./create-ai-insight.dto");
class UpdateAIInsightDto extends (0, mapped_types_1.PartialType)(create_ai_insight_dto_1.CreateAIInsightDto) {
}
exports.UpdateAIInsightDto = UpdateAIInsightDto;
//# sourceMappingURL=update-ai-insight.dto.js.map