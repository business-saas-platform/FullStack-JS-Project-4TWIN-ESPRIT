import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("users")
export class UsersController {
  constructor(private s: UsersService) {}
  @Post() create(@Body() dto: CreateUserDto) { return this.s.create(dto); }
  @Get() findAll() { return this.s.findAll(); }
  @Get(":id") findOne(@Param("id") id: string) { return this.s.findOne(id); }
  @Patch(":id") update(@Param("id") id: string, @Body() dto: UpdateUserDto) { return this.s.update(id, dto); }
  @Delete(":id") remove(@Param("id") id: string) { return this.s.remove(id); }
}
