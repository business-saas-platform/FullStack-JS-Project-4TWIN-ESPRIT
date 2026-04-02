import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { RegistrationRequestEntity } from "./entities/registration-request.entity";
import { RegistrationRequestsService } from "./registration-requests.service";
import { RegistrationRequestsController } from "./registration-requests.controller";

import { UserEntity } from "../users/entities/user.entity";
import { BusinessEntity } from "../businesses/entities/business.entity";
import { TeamMemberEntity } from "../team-members/entities/team-member.entity";

import { MailModule } from "../mail/mail.module";
import { AuthModule } from "../auth/auth.module";
import { PlatformAdminDbGuard } from "src/common/guards/platform-admin-db.guard";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RegistrationRequestEntity,
      UserEntity,
      BusinessEntity,
      TeamMemberEntity,
    ]),
    MailModule,
    AuthModule, // ✅ add
  ],
  controllers: [RegistrationRequestsController],
  providers: [RegistrationRequestsService,PlatformAdminDbGuard],
})
export class RegistrationRequestsModule {}