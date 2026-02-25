import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";

import { RegistrationRequestsService } from "./registration-requests.service";
import { CreateRegistrationRequestDto } from "./dto/create-registration-request.dto";
import { ApproveRequestDto, RejectRequestDto } from "./dto/review-request.dto";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PlatformAdminDbGuard } from "../../common/guards/platform-admin-db.guard";

@Controller("registration-requests")
export class RegistrationRequestsController {
  constructor(private readonly service: RegistrationRequestsService) {}

  // =====================================================
  // PUBLIC — Owner submits registration request
  // =====================================================
  @Post()
  create(@Body() dto: CreateRegistrationRequestDto) {
    return this.service.create(dto);
  }

  // =====================================================
  // ADMIN — List requests (platform_admin only)
  // =====================================================
  @UseGuards(JwtAuthGuard, PlatformAdminDbGuard)
  @Get()
  list(
    @Query("status") status?: "pending" | "approved" | "rejected"
  ) {
    return this.service.list(status ?? "pending");
  }

  // =====================================================
  // ADMIN — Approve request
  // =====================================================
  @UseGuards(JwtAuthGuard, PlatformAdminDbGuard)
  @Post(":id/approve")
  approve(
    @Param("id") id: string,
    @Req() req: any,
    @Body() dto: ApproveRequestDto
  ) {
    return this.service.approve(
      id,
      { id: req.user.sub, role: req.user.role },
      dto
    );
  }

  // =====================================================
  // ADMIN — Reject request
  // =====================================================
  @UseGuards(JwtAuthGuard, PlatformAdminDbGuard)
  @Post(":id/reject")
  reject(
    @Param("id") id: string,
    @Req() req: any,
    @Body() dto: RejectRequestDto
  ) {
    return this.service.reject(
      id,
      { id: req.user.sub, role: req.user.role },
      dto
    );
  }
}