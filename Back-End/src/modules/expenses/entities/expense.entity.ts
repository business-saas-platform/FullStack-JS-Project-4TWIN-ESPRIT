import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { ExpenseStatus } from "../../../common/enums";

@Entity("expenses")
export class ExpenseEntity {
  @PrimaryGeneratedColumn("uuid") id!: string;

  @Index()
  @Column({ type: "uuid" }) businessId!: string;

  @Column() date!: string;
  @Column({ type: "double precision" }) amount!: number;
  @Column() currency!: string;
  @Column() category!: string;
  @Column() vendor!: string;
  @Column() description!: string;
  @Column() paymentMethod!: string;

  @Column({ type: "enum", enum: ["pending","approved","rejected"], default: "pending" })
  status!: ExpenseStatus;

  @Column({ nullable: true }) receiptUrl?: string;
  @Column() submittedBy!: string;
  @Column({ nullable: true }) approvedBy?: string;

  @CreateDateColumn() createdAt!: Date;
}
