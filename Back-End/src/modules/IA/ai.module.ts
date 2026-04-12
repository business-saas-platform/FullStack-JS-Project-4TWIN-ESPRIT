import { Module } from "@nestjs/common";
import { AiService } from "./ai.service";
import { AiController } from "./ai.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InvoiceEntity } from "../invoices/entities/invoice.entity";
import { ClientsModule } from "../clients/clients.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([InvoiceEntity]),
    ClientsModule,
  ],
  providers: [AiService],
  controllers: [AiController],
})
export class AiModule {}