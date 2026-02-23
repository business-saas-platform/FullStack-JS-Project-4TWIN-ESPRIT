import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "../../../common/enums";

@Entity("users")
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column()
  email!: string;

  @Column()
  name!: string;

  @Column({
    type: "enum",
    enum: ["platform_admin","business_owner","business_admin","accountant","team_member","client"],
  })
  role!: UserRole;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  githubId?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true })
  passwordHash?: string;

  @Index()
  @Column({ type: "uuid", nullable: true })
  businessId?: string;

  @Column({ type: "boolean", default: false })
  mustChangePassword!: boolean;

  // ✅ brute-force protection (keep only these)
  @Column({ type: "int", default: 0 })
  loginAttempts!: number;

  @Column({ type: "timestamptz", nullable: true })
  lockedUntil!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}