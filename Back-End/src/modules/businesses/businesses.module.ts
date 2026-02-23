import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BusinessEntity } from "./entities/business.entity";
import { BusinessesController } from "./businesses.controller";
import { BusinessesService } from "./businesses.service";

@Module({
  imports: [TypeOrmModule.forFeature([BusinessEntity])],
  controllers: [BusinessesController],
  providers: [BusinessesService],
})
export class BusinessesModule {}
