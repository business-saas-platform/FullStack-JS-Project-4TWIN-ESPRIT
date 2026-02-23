import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ClientsService } from "./clients.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { BusinessAccessGuard } from "../../common/guards/business-access.guard";
import { BusinessId } from "../../common/decorators/business-id.decorator";

@Controller("clients")
@UseGuards(JwtAuthGuard, BusinessAccessGuard)
export class ClientsController {
  constructor(private readonly s: ClientsService) {}

  @Post()
  create(@BusinessId() businessId: string, @Body() dto: CreateClientDto) {
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
  update(@BusinessId() businessId: string, @Param("id") id: string, @Body() dto: UpdateClientDto) {
    return this.s.update(businessId, id, dto);
  }

  @Delete(":id")
  remove(@BusinessId() businessId: string, @Param("id") id: string) {
    return this.s.remove(businessId, id);
  }
}
