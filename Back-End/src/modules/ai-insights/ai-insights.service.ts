import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AIInsightEntity } from "./entities/ai-insight.entity";
import { CreateAIInsightDto } from "./dto/create-ai-insight.dto";
import { UpdateAIInsightDto } from "./dto/update-ai-insight.dto";
import { toIso } from "../../common/api-mapper";

@Injectable()
export class AIInsightsService {
  constructor(@InjectRepository(AIInsightEntity) private repo: Repository<AIInsightEntity>) {}

  async create(businessId: string, dto: CreateAIInsightDto) {
const entity = this.repo.create({ ...(dto as any), businessId } as any) as unknown as AIInsightEntity;    const saved: AIInsightEntity = await this.repo.save(entity);
    return this.toApi(saved);
  }

  async findAll(businessId: string) {
    const list = await this.repo.find({ where: { businessId }, order: { createdAt: "DESC" } });
    return list.map((a) => this.toApi(a));
  }

  async findOne(businessId: string, id: string) {
    const a = await this.repo.findOne({ where: { id, businessId } as any });
    if (!a) throw new NotFoundException("AI insight not found");
    return this.toApi(a);
  }

  async update(businessId: string, id: string, dto: UpdateAIInsightDto) {
    const a = await this.repo.findOne({ where: { id, businessId } as any });
    if (!a) throw new NotFoundException("AI insight not found");
    Object.assign(a, dto as any);
    const saved: AIInsightEntity = await this.repo.save(a);
    return this.toApi(saved);
  }

  async remove(businessId: string, id: string) {
    const res = await this.repo.delete({ id, businessId } as any);
    if (!res.affected) throw new NotFoundException("AI insight not found");
    return { deleted: true, id };
  }

  private toApi(a: AIInsightEntity) {
    return {
      id: a.id,
      businessId: a.businessId,
      type: a.type,
      category: a.category,
      title: a.title,
      description: a.description,
      confidence: a.confidence,
      actionable: a.actionable,
      action: a.action,
      impact: a.impact,
      createdAt: toIso(a.createdAt),
    };
  }
}
