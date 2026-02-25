import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class LoginDto {
  @IsEmail() email!: string;
  @IsString() @IsNotEmpty() password!: string;
  // ✅ allow captchaToken in body
  @IsOptional()
  @IsString()
  captchaToken?: string;
}
