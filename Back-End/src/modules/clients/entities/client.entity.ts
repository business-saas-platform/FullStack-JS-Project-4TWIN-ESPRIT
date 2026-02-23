import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { ClientStatus, ClientType } from "../../../common/enums";

@Entity("clients")
export class ClientEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  businessId!: string;

  @Column() name!: string;
  @Column() email!: string;
  @Column() phone!: string;
  @Column() address!: string;
  @Column() city!: string;
  @Column() postalCode!: string;
  @Column() country!: string;

  @Column({ nullable: true }) taxId?: string;

  @Column({ type: "enum", enum: ["individual","company"] })
  type!: ClientType;

  @Column({ type: "enum", enum: ["active","inactive"], default: "active" })
  status!: ClientStatus;

  @Column({ type: "double precision", default: 0 }) totalRevenue!: number;
  @Column({ type: "double precision", default: 0 }) outstandingBalance!: number;

  @CreateDateColumn() createdAt!: Date;

  @Column({ nullable: true }) lastContactDate?: string;
  @Column({ type: "text", nullable: true }) notes?: string;
}
