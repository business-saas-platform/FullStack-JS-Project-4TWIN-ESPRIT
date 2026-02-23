import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { AIImpact, AIInsightCategory, AIInsightType } from "../../../common/enums";

@Entity("ai_insights")
export class AIInsightEntity {
  @PrimaryGeneratedColumn("uuid") id!: string;

  @Index()
  @Column({ type: "uuid" }) businessId!: string;

  @Column({ type: "enum", enum: ["prediction","warning","recommendation","opportunity"] })
  type!: AIInsightType;

  @Column({ type: "enum", enum: ["revenue","expenses","clients","cash_flow","invoices"] })
  category!: AIInsightCategory;

  @Column() title!: string;
  @Column({ type: "text" }) description!: string;

  @Column({ type: "double precision" }) confidence!: number;
  @Column() actionable!: boolean;

  @Column({ nullable: true }) action?: string;

  @Column({ type: "enum", enum: ["high","medium","low"], nullable: true })
  impact?: AIImpact;

  @CreateDateColumn() createdAt!: Date;
}
