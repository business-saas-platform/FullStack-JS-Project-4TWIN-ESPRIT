import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { BusinessesService } from "./businesses.service";
import { CreateBusinessDto } from "./dto/create-business.dto";
import { UpdateBusinessDto } from "./dto/update-business.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { BusinessAccessGuard } from "../../common/guards/business-access.guard";

@Controller("businesses")
@UseGuards(JwtAuthGuard)
export class BusinessesController {
  constructor(private readonly s: BusinessesService) {}

  // ✅ Owner: list only his businesses
  @Get()
  listMine(@Req() req: any) {
    return this.s.listByOwner(req.user.id); // ✅ id not sub
  }

  // ✅ Owner: create business
  @Post()
  create(@Req() req: any, @Body() dto: CreateBusinessDto) {
    return this.s.createForOwner(req.user.id, dto);
  }

  // ✅ Owner: complete profile (owner only)
  @Patch(":id/profile")
  completeProfile(@Param("id") id: string, @Req() req: any, @Body() dto: any) {
    return this.s.completeProfile(id, req.user.id, dto);
  }

  // ✅ Get business by id for ANY user that has access
  // Team/accountant -> must send x-business-id == :id (frontend already does)
  @UseGuards(BusinessAccessGuard)
  @Get(":id")
  getById(@Req() req: any, @Param("id") id: string) {
    // guard already validated access; enforce same business
    req.businessId = id;
    return this.s.getById(req.businessId);
  }

  // ✅ Optional: "current business" endpoint (nice for non-owner)
  @UseGuards(BusinessAccessGuard)
  @Get("current/one")
  current(@Req() req: any) {
    // uses x-business-id
    return this.s.getById(req.businessId);
  }

  // ✅ Owner update/delete stay owner-only
  @Patch(":id")
  update(@Req() req: any, @Param("id") id: string, @Body() dto: UpdateBusinessDto) {
    return this.s.updateForOwner(req.user.id, id, dto);
  }

  @Delete(":id")
  remove(@Req() req: any, @Param("id") id: string) {
    return this.s.removeForOwner(req.user.id, id);
  }
}