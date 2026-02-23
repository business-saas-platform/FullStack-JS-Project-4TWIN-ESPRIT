import { Module } from "@nestjs/common";
import { TenantModule } from "../../common/tenant/tenant.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InvoiceEntity } from "./entities/invoice.entity";
import { InvoiceItemEntity } from "./entities/invoice-item.entity";
import { InvoicesController } from "./invoices.controller";
import { InvoicesService } from "./invoices.service";

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceEntity, InvoiceItemEntity, TenantModule])],
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}
