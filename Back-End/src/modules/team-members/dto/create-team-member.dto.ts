import { IsArray, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateTeamMemberDto {
  @IsUUID() @IsNotEmpty() businessId!: string;
  @IsString() @IsNotEmpty() name!: string;
  @IsEmail() email!: string;

  @IsIn(["business_owner","business_admin","accountant","team_member"])
  role!: any;

  @IsOptional() @IsString() avatar?: string;
  @IsOptional() @IsString() phone?: string;

  @IsOptional() @IsIn(["active","inactive","invited"])
  status?: any;

  @IsArray() permissions!: string[];
  @IsString() joinedAt!: string;
  @IsOptional() @IsString() lastActive?: string;
}
