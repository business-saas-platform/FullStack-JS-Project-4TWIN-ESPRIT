import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { InvoiceEntity } from "./invoice.entity";

@Entity("invoice_items")
export class InvoiceItemEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => InvoiceEntity, (inv) => inv.items, { onDelete: "CASCADE" })
  invoice!: InvoiceEntity;

  @Column()
  description!: string;

  @Column({ type: "double precision" })
  quantity!: number;

  @Column({ type: "double precision" })
  unitPrice!: number;

  @Column({ type: "double precision", default: 0 })
  taxRate!: number; // ✅ default

  @Column({ type: "double precision" })
  amount!: number;
}
