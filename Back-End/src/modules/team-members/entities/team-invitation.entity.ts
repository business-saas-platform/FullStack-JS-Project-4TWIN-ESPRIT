import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("team_invitations")
export class TeamInvitationEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  businessId!: string;

  @Index()
  @Column()
  email!: string;

  @Column()
  name!: string;

  @Column({ type: "enum", enum: ["business_admin", "accountant", "team_member"] })
  role!: "business_admin" | "accountant" | "team_member";

  @Column({ type: "text", array: true, default: () => "ARRAY[]::text[]" })
  permissions!: string[];

  @Index({ unique: true })
  @Column()
  token!: string;

  @Column({ type: "timestamptz" })
  expiresAt!: Date;

  @Column({ type: "enum", enum: ["pending", "accepted", "revoked"], default: "pending" })
  status!: "pending" | "accepted" | "revoked";

  @CreateDateColumn()
  createdAt!: Date;
}
