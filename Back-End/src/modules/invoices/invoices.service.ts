import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { InvoiceEntity } from "./entities/invoice.entity";
import { InvoiceItemEntity } from "./entities/invoice-item.entity";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(InvoiceEntity) private repo: Repository<InvoiceEntity>,
    @InjectRepository(InvoiceItemEntity) private items: Repository<InvoiceItemEntity>
  ) {}

  async create(businessId: string, dto: CreateInvoiceDto) {
const invoiceEntity = this.repo.create({ ...(dto as any), businessId } as any) as unknown as InvoiceEntity;    const saved: InvoiceEntity = await this.repo.save(invoiceEntity);

    const list: any[] = (dto as any).items ?? [];
    if (Array.isArray(list) && list.length) {
      const itemEntities: InvoiceItemEntity[] = list.map((it) =>
        this.items.create({
          invoice: saved,
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          taxRate: it.taxRate ?? 0,
          amount: it.amount ?? (it.quantity * it.unitPrice),
        } as any)
      ) as any;
      await this.items.save(itemEntities);
    }

    const withItems = await this.repo.findOne({ where: { id: saved.id, businessId } as any });
    return this.toApi(withItems ?? saved);
  }

  async findAll(businessId: string) {
    const list = await this.repo.find({ where: { businessId } as any, order: { issueDate: "DESC" } as any });
    return list.map((inv) => this.toApi(inv));
  }

  async findOne(businessId: string, id: string) {
    const inv = await this.repo.findOne({ where: { id, businessId } as any });
    if (!inv) throw new NotFoundException("Invoice not found");
    return this.toApi(inv);
  }

  async update(businessId: string, id: string, dto: UpdateInvoiceDto) {
    const inv = await this.repo.findOne({ where: { id, businessId } as any });
    if (!inv) throw new NotFoundException("Invoice not found");
    Object.assign(inv, dto as any);
    const saved: InvoiceEntity = await this.repo.save(inv);
    const updated = await this.repo.findOne({ where: { id: saved.id, businessId } as any });
    return this.toApi(updated ?? saved);
  }

  async remove(businessId: string, id: string) {
    const res = await this.repo.delete({ id, businessId } as any);
    if (!res.affected) throw new NotFoundException("Invoice not found");
    return { deleted: true, id };
  }

  private toApi(inv: InvoiceEntity) {
    return {
      id: inv.id,
      businessId: inv.businessId,
      invoiceNumber: inv.invoiceNumber,
      clientId: inv.clientId,
      clientName: inv.clientName,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      status: inv.status,
      subtotal: inv.subtotal,
      taxAmount: inv.taxAmount,
      totalAmount: inv.totalAmount,
      paidAmount: inv.paidAmount,
      currency: inv.currency,
      notes: inv.notes,
      items: (inv.items ?? []).map((it) => ({
        id: it.id,
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        taxRate: it.taxRate,
        amount: it.amount,
      })),
    };
  }
}
