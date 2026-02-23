import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

export type RegistrationStatus = "pending" | "approved" | "rejected";

@Entity("registration_requests")
export class RegistrationRequestEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // owner info
  @Index()
  @Column()
  ownerEmail!: string;

  @Column()
  ownerName!: string;

  // company basic info
  @Column()
  companyName!: string;

  @Column()
  companyCategory!: string; // or industry

  @Column({ nullable: true })
  companyPhone?: string;

  @Column({ nullable: true })
  companyAddress?: string;

  @Column({ nullable: true })
  companyTaxId?: string; // matricule

  @Column({ type: "enum", enum: ["pending","approved","rejected"], default: "pending" })
  status!: RegistrationStatus;

  @Column({ type: "text", nullable: true })
  rejectionReason?: string | null;

  @Column({ type: "uuid", nullable: true })
  reviewedByAdminId?: string | null;

  @Column({ type: "timestamptz", nullable: true })
  reviewedAt?: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}
