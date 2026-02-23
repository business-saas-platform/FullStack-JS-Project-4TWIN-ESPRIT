import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { BusinessesService } from "./businesses.service";
import { CreateBusinessDto } from "./dto/create-business.dto";
import { UpdateBusinessDto } from "./dto/update-business.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("businesses")
export class BusinessesController {
  constructor(private readonly s: BusinessesService) {}

  // ✅ Owner يشوف كان الشركات متاعو
  @UseGuards(JwtAuthGuard)
  @Get()
  listMine(@Req() req: any) {
    return this.s.listByOwner(req.user.sub);
  }

  // ✅ Create business مربوط بالـ owner
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() dto: CreateBusinessDto) {
    return this.s.createForOwner(req.user.sub, dto);
  }
  @UseGuards(JwtAuthGuard)
@Patch(":id/profile")
async completeProfile(@Param("id") id: string, @Req() req: any, @Body() dto: any) {
  // check owner access: business.ownerId == req.user.sub
  return this.s.completeProfile(id, req.user.sub, dto);
}


  // ✅ نخلّيوهم protected زادة (اختياري لكن منطقي)
  @UseGuards(JwtAuthGuard)
  @Get(":id")
  findOne(@Req() req: any, @Param("id") id: string) {
    // service لازم يتأكد business.ownerId == req.user.sub
    return this.s.findOneForOwner(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(@Req() req: any, @Param("id") id: string, @Body() dto: UpdateBusinessDto) {
    return this.s.updateForOwner(req.user.sub, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Req() req: any, @Param("id") id: string) {
    return this.s.removeForOwner(req.user.sub, id);
  }
}
