import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BusinessEntity } from "./entities/business.entity";
import { BusinessesController } from "./businesses.controller";
import { BusinessesService } from "./businesses.service";
import { TeamMemberEntity } from "../team-members/entities/team-member.entity";
import { BusinessFilesController } from "./business-files.controller";

@Module({
  imports: [TypeOrmModule.forFeature([BusinessEntity,TeamMemberEntity])],
  controllers: [BusinessesController,BusinessFilesController],
  providers: [BusinessesService],
})
export class BusinessesModule {}
