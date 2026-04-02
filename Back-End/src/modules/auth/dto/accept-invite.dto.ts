import { IsString, MinLength } from "class-validator";

export class AcceptInviteDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
