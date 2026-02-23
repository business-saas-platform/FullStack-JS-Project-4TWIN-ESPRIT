import { Module } from "@nestjs/common";
import { TenantModule } from "../../common/tenant/tenant.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClientEntity } from "./entities/client.entity";
import { ClientsController } from "./clients.controller";
import { ClientsService } from "./clients.service";

@Module({
  imports: [TypeOrmModule.forFeature([ClientEntity, TenantModule])],
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}
