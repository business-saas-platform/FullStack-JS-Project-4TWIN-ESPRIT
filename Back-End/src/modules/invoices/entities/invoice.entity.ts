import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { InvoiceStatus } from "../../../common/enums";
import { InvoiceItemEntity } from "./invoice-item.entity";

@Entity("invoices")
export class InvoiceEntity {
  @PrimaryGeneratedColumn("uuid") id!: string;

  @Column() invoiceNumber!: string;

  @Index()
  @Column({ type: "uuid" }) businessId!: string;

  @Index()
  @Column({ type: "uuid" }) clientId!: string;

  @Column() clientName!: string;
  @Column() issueDate!: string;
  @Column() dueDate!: string;

  @Column({ type: "enum", enum: ["draft","sent","viewed","paid","overdue","cancelled"], default: "draft" })
  status!: InvoiceStatus;

  @Column({ type: "double precision", default: 0 }) subtotal!: number;
  @Column({ type: "double precision", default: 0 }) taxAmount!: number;
  @Column({ type: "double precision", default: 0 }) totalAmount!: number;
  @Column({ type: "double precision", default: 0 }) paidAmount!: number;

  @Column() currency!: string;
  @Column({ type: "text", nullable: true }) notes?: string;

  @OneToMany(() => InvoiceItemEntity, (it) => it.invoice, { cascade: true, eager: true })
  items!: InvoiceItemEntity[];
}
