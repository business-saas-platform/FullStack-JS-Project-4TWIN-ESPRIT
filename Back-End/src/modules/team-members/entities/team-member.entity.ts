import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { TeamMemberRole, TeamMemberStatus } from "../../../common/enums";

@Entity("team_members")
export class TeamMemberEntity {
  @PrimaryGeneratedColumn("uuid") id!: string;

  @Index()
  @Column({ type: "uuid" }) businessId!: string;

  @Column() name!: string;
  @Column() email!: string;

  @Column({ type: "enum", enum: ["business_owner","business_admin","accountant","team_member"] })
  role!: TeamMemberRole;

  @Column({ nullable: true }) avatar?: string;
  @Column({ nullable: true }) phone?: string;

  @Column({ type: "enum", enum: ["active","inactive","invited"], default: "active" })
  status!: TeamMemberStatus;

  @Column({ type: "text", array: true, default: () => "ARRAY[]::text[]" })
  permissions!: string[];

  @Column() joinedAt!: string;
  @Column({ nullable: true }) lastActive?: string;

  @CreateDateColumn() createdAt!: Date;
}
