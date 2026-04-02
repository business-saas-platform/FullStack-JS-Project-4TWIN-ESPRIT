import { PartialType } from "@nestjs/mapped-types";
import { CreateAIInsightDto } from "./create-ai-insight.dto";
export class UpdateAIInsightDto extends PartialType(CreateAIInsightDto) {}
