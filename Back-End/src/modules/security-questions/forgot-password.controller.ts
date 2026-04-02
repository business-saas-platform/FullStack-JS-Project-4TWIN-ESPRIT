// src/modules/security-questions/forgot-password.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { SecurityQuestionsService } from './security-questions.service';
import {
  ForgotPasswordInitDto,
  VerifySecurityAnswersDto,
  ResetPasswordDto,
} from './security-questions.dto';

@Controller('auth/forgot-password')
export class ForgotPasswordController {
  constructor(private readonly sqService: SecurityQuestionsService) {}

  @Post('init')
  forgotInit(@Body() dto: ForgotPasswordInitDto) {
    return this.sqService.forgotPasswordInit(dto);
  }

  @Post('verify')
  forgotVerify(@Body() dto: VerifySecurityAnswersDto) {
    return this.sqService.verifySecurityAnswers(dto);
  }

  @Post('reset')
  forgotReset(@Body() dto: ResetPasswordDto) {
    return this.sqService.resetPassword(dto);
  }
}