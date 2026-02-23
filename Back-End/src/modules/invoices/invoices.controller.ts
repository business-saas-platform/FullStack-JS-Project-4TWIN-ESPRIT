import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { InvoicesService } from "./invoices.service";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { BusinessAccessGuard } from "../../common/guards/business-access.guard";
import { BusinessId } from "../../common/decorators/business-id.decorator";

@Controller("invoices")
@UseGuards(JwtAuthGuard, BusinessAccessGuard)
export class InvoicesController {
  constructor(private readonly s: InvoicesService) {}

  @Post()
  create(@BusinessId() businessId: string, @Body() dto: CreateInvoiceDto) {
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
  update(@BusinessId() businessId: string, @Param("id") id: string, @Body() dto: UpdateInvoiceDto) {
    return this.s.update(businessId, id, dto);
  }

  @Delete(":id")
  remove(@BusinessId() businessId: string, @Param("id") id: string) {
    return this.s.remove(businessId, id);
  }
}
