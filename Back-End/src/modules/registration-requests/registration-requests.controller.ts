import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { RegistrationRequestsService } from "./registration-requests.service";
import { CreateRegistrationRequestDto } from "./dto/create-registration-request.dto";
import { ApproveRequestDto, RejectRequestDto } from "./dto/review-request.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("registration-requests")
export class RegistrationRequestsController {
  constructor(private readonly service: RegistrationRequestsService) {}

  // Public: owner submits request
  @Post()
  create(@Body() dto: CreateRegistrationRequestDto) {
    return this.service.create(dto);
  }

  // Admin: list requests
  @UseGuards(JwtAuthGuard)
  @Get()
  list(@Req() req: any, @Query("status") status?: "pending" | "approved" | "rejected") {
    return this.service.list(status ?? "pending");
  }

  // Admin: approve
  @UseGuards(JwtAuthGuard)
  @Post(":id/approve")
  approve(@Param("id") id: string, @Req() req: any, @Body() dto: ApproveRequestDto) {
    return this.service.approve(id, { id: req.user.sub, role: req.user.role }, dto);
  }

  // Admin: reject
  @UseGuards(JwtAuthGuard)
  @Post(":id/reject")
  reject(@Param("id") id: string, @Req() req: any, @Body() dto: RejectRequestDto) {
    return this.service.reject(id, { id: req.user.sub, role: req.user.role }, dto);
  }
}
