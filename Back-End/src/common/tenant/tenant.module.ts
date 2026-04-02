import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BusinessEntity } from "../../modules/businesses/entities/business.entity";
import { UserEntity } from "../../modules/users/entities/user.entity";
import { BusinessAccessGuard } from "../guards/business-access.guard";

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([BusinessEntity, UserEntity])],
  providers: [BusinessAccessGuard],
  exports: [BusinessAccessGuard, TypeOrmModule],
})
export class TenantModule {}