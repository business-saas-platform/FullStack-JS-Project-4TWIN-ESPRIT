import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { RegistrationRequestEntity } from "./entities/registration-request.entity";
import { RegistrationRequestsService } from "./registration-requests.service";
import { RegistrationRequestsController } from "./registration-requests.controller";

import { UserEntity } from "../users/entities/user.entity";
import { BusinessEntity } from "../businesses/entities/business.entity";
import { TeamMemberEntity } from "../team-members/entities/team-member.entity";

import { MailModule } from "../mail/mail.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RegistrationRequestEntity,
      UserEntity,
      BusinessEntity,
      TeamMemberEntity,
    ]),
    MailModule,
  ],
  controllers: [RegistrationRequestsController],
  providers: [RegistrationRequestsService],
})
export class RegistrationRequestsModule {}
