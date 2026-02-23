import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ExpensesService } from "./expenses.service";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { UpdateExpenseDto } from "./dto/update-expense.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { BusinessAccessGuard } from "../../common/guards/business-access.guard";
import { BusinessId } from "../../common/decorators/business-id.decorator";

@Controller("expenses")
@UseGuards(JwtAuthGuard, BusinessAccessGuard)
export class ExpensesController {
  constructor(private readonly s: ExpensesService) {}

  @Post()
  create(@BusinessId() businessId: string, @Body() dto: CreateExpenseDto) {
    return this.s.create(businessId, dto);
  }

  @Get()
  findAll(@BusinessId() businessId: string) {
    return this.s.findAll(businessId);
  }

  @Get(":id")
  findOne(@BusinessId() businessId: string, @Param("id") id: string) {
    return this.s.findOne(businessId, id);
  }

  @Patch(":id")
  update(@BusinessId() businessId: string, @Param("id") id: string, @Body() dto: UpdateExpenseDto) {
    return this.s.update(businessId, id, dto);
  }

  @Delete(":id")
  remove(@BusinessId() businessId: string, @Param("id") id: string) {
    return this.s.remove(businessId, id);
  }
}
