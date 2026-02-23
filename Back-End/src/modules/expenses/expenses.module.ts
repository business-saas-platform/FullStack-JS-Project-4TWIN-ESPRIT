import { Module } from "@nestjs/common";
import { TenantModule } from "../../common/tenant/tenant.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExpenseEntity } from "./entities/expense.entity";
import { ExpensesController } from "./expenses.controller";
import { ExpensesService } from "./expenses.service";

@Module({
  imports: [TypeOrmModule.forFeature([ExpenseEntity, TenantModule])],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
