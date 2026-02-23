import { IsArray, IsEmail, IsEnum, IsString, IsUUID } from "class-validator";

export class InviteTeamMemberDto {
  @IsUUID()
  businessId!: string;

  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

@IsEnum(["business_owner","business_admin","accountant","team_member"])
role!: "business_owner" | "business_admin" | "accountant" | "team_member";


  @IsArray()
  permissions!: string[];
}
