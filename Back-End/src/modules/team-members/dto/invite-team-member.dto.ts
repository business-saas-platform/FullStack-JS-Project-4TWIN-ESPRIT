import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export type TeamRole = "business_admin" | "accountant" | "team_member";

export class InviteTeamMemberDto {
  @IsUUID()
  businessId!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsIn(["business_admin", "accountant", "team_member"])
  role!: TeamRole;
  @IsOptional()
@IsString()
status?: string;

@IsOptional()
@IsString()
joinedAt?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  permissions?: string[];
}