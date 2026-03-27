import { IsString, IsNotEmpty, IsArray, ArrayMinSize, ArrayMaxSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SecurityQuestionItemDto {
  @IsString() @IsNotEmpty()
  question!: string;

  @IsString() @IsNotEmpty()
  answer!: string;
}

export class SetupSecurityQuestionsDto {
  @IsArray() @ArrayMinSize(3) @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => SecurityQuestionItemDto)
  questions!: SecurityQuestionItemDto[];
}

export class ForgotPasswordInitDto {
  @IsString() @IsNotEmpty()
  email!: string;
}

export class VerifySecurityAnswersDto {
  @IsString() @IsNotEmpty()
  resetToken!: string;

  @IsArray() @ArrayMinSize(3) @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => SecurityQuestionItemDto)
  answers!: SecurityQuestionItemDto[];
}

export class ResetPasswordDto {
  @IsString() @IsNotEmpty()
  resetToken!: string;

  @IsString() @IsNotEmpty()
  newPassword!: string;
}