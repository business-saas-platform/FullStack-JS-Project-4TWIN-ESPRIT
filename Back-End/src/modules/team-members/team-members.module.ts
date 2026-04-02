import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TeamMemberEntity } from "./entities/team-member.entity";
import { TeamMembersController } from "./team-members.controller";
import { TeamMembersService } from "./team-members.service";
import { BusinessEntity } from "../businesses/entities/business.entity";
import { TeamInvitationEntity } from "./entities/team-invitation.entity";
import { MailModule } from "../mail/mail.module"; // ✅ import mail module
@Module({
  imports: [TypeOrmModule.forFeature([TeamMemberEntity, BusinessEntity, TeamInvitationEntity]),MailModule],
  controllers: [TeamMembersController],
  providers: [TeamMembersService],
})
export class TeamMembersModule {}
