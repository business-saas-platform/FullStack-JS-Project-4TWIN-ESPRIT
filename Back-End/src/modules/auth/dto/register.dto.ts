import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class RegisterDto {
  @IsEmail() email!: string;
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsNotEmpty() password!: string;

  @IsOptional()
  @IsIn(["platform_admin","business_owner","business_admin","accountant","team_member","client"])
  role?: any;

  @IsOptional() @IsUUID() businessId?: string;
}
