import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ClientsService } from "./clients.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { BusinessAccessGuard } from "../../common/guards/business-access.guard";
import { BusinessId } from "../../common/decorators/business-id.decorator";

// ✅ NEW
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";

@Controller("clients")
@UseGuards(JwtAuthGuard, BusinessAccessGuard, PermissionsGuard)
export class ClientsController {
  constructor(private readonly s: ClientsService) {}

  @Post()
  @RequirePermissions("clients:create")
  create(@BusinessId() businessId: string, @Body() dto: CreateClientDto) {
    return this.s.create(businessId, dto);
  }

  @Get()
  @RequirePermissions("clients:read")
  findAll(@BusinessId() businessId: string) {
    return this.s.findAll(businessId);
  }

  @Get(":id")
  @RequirePermissions("clients:read")
  findOne(@BusinessId() businessId: string, @Param("id") id: string) {
    return this.s.findOne(businessId, id);
  }

  @Patch(":id")
  @RequirePermissions("clients:update")
  update(
    @BusinessId() businessId: string,
    @Param("id") id: string,
    @Body() dto: UpdateClientDto
  ) {
    return this.s.update(businessId, id, dto);
  }

  @Delete(":id")
  @RequirePermissions("clients:delete")
  remove(@BusinessId() businessId: string, @Param("id") id: string) {
    return this.s.remove(businessId, id);
  }
}