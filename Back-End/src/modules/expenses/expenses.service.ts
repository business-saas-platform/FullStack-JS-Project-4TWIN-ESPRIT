import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ExpenseEntity } from "./entities/expense.entity";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { UpdateExpenseDto } from "./dto/update-expense.dto";
import { toIso } from "../../common/api-mapper";

@Injectable()
export class ExpensesService {
  constructor(@InjectRepository(ExpenseEntity) private repo: Repository<ExpenseEntity>) {}

  async create(businessId: string, dto: CreateExpenseDto) {
const entity = this.repo.create({ ...(dto as any), businessId } as any) as unknown as ExpenseEntity;    const saved: ExpenseEntity = await this.repo.save(entity);
    return this.toApi(saved);
  }

  async findAll(businessId: string) {
    const list = await this.repo.find({ where: { businessId }, order: { createdAt: "DESC" } });
    return list.map((e) => this.toApi(e));
  }

  async findOne(businessId: string, id: string) {
    const e = await this.repo.findOne({ where: { id, businessId } as any });
    if (!e) throw new NotFoundException("Expense not found");
    return this.toApi(e);
  }

  async update(businessId: string, id: string, dto: UpdateExpenseDto) {
    const e = await this.repo.findOne({ where: { id, businessId } as any });
    if (!e) throw new NotFoundException("Expense not found");
    Object.assign(e, dto as any);
    const saved: ExpenseEntity = await this.repo.save(e);
    return this.toApi(saved);
  }

  async remove(businessId: string, id: string) {
    const res = await this.repo.delete({ id, businessId } as any);
    if (!res.affected) throw new NotFoundException("Expense not found");
    return { deleted: true, id };
  }

  private toApi(e: ExpenseEntity) {
    return {
      id: e.id,
      businessId: e.businessId,
      date: e.date,
      amount: e.amount,
      currency: e.currency,
      category: e.category,
      vendor: e.vendor,
      description: e.description,
      paymentMethod: e.paymentMethod,
      status: e.status,
      receiptUrl: e.receiptUrl,
      submittedBy: e.submittedBy,
      approvedBy: e.approvedBy,
      createdAt: toIso(e.createdAt),
    };
  }
}
