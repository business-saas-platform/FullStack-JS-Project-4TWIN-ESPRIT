import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { SecurityQuestionsService } from './security-questions.service';
import {
  SetupSecurityQuestionsDto,
  ForgotPasswordInitDto,
  VerifySecurityAnswersDto,
  ResetPasswordDto,
} from './security-questions.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // your existing guard
import { Request as ExpressRequest } from 'express';

@Controller('security-questions')  // ← add this
export class SecurityQuestionsController {
  constructor(private readonly sqService: SecurityQuestionsService) {}

  /**
   * Authenticated: setup/update security questions
   * POST /security-questions/setup
   */
@UseGuards(JwtAuthGuard)
@Post('setup')
async setup(@Request() req: ExpressRequest & { user: { sub: string } }, @Body() dto: SetupSecurityQuestionsDto) {
  return this.sqService.setupQuestions(req.user.sub, dto);
}

  /**
   * Authenticated: check if user has set security questions
   * GET /security-questions/status
   */
 @UseGuards(JwtAuthGuard)
@Get('status')
async status(@Request() req: ExpressRequest & { user: { sub: string } }) {
  const hasQuestions = await this.sqService.hasQuestions(req.user.sub);
  return { hasQuestions };
}

  /**
   * Public: step 1 — provide email, receive questions + token
   * POST /auth/forgot-password/init
   */
  @Post('auth/forgot-password/init')
  async forgotInit(@Body() dto: ForgotPasswordInitDto) {
    return this.sqService.forgotPasswordInit(dto);
  }

  /**
   * Public: step 2 — submit answers, receive verified token
   * POST /auth/forgot-password/verify
   */
  @Post('auth/forgot-password/verify')
  async forgotVerify(@Body() dto: VerifySecurityAnswersDto) {
    return this.sqService.verifySecurityAnswers(dto);
  }

  /**
   * Public: step 3 — reset password with verified token
   * POST /auth/forgot-password/reset
   */
  @Post('auth/forgot-password/reset')
  async forgotReset(@Body() dto: ResetPasswordDto) {
    return this.sqService.resetPassword(dto);
  }
}
