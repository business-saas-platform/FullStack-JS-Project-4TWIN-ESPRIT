// src/modules/auth/auth.controller.ts
import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { AuthGuard } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { ChangePasswordDto } from "./dto/change-password.dto";

import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { AcceptInviteDto } from "./dto/accept-invite.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService
  ) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Req() req: any) {
    return this.authService.me(req.user.sub);
  }
  @UseGuards(JwtAuthGuard)
@Post("change-password-first")
changePasswordFirst(@Req() req: any, @Body() dto: ChangePasswordDto) {
  return this.authService.changePasswordFirst(req.user.sub, dto.newPassword);
}

  @Post("accept-invite")
  acceptInvite(@Body() dto: AcceptInviteDto) {
    return this.authService.acceptInvite(dto);
  }

  // =========================
  // GOOGLE OAUTH (inchangé)
  // =========================
  @Get("google")
  @UseGuards(AuthGuard("google"))
  googleAuth() {}

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const token = await this.authService.generateJwt(req.user);
    return res.redirect(
      `${process.env.FRONTEND_URL}/oauth-success?token=${token}`
    );
  }

  // =========================
  // GITHUB OAUTH (corrigé)
  // =========================
  @Get("github")
  @UseGuards(AuthGuard("github"))
  githubAuth() {
    // redirige vers GitHub automatiquement
  }

  @Get("github/callback")
  @UseGuards(AuthGuard("github"))
  async githubCallback(@Req() req: any, @Res() res: Response) {
    // ✅ version propre : crée/merge user + retourne JWT
    const { access_token } = await this.authService.loginWithOAuth(req.user);

    const front =
      this.config.get<string>("FRONTEND_URL") ||
      process.env.FRONTEND_URL ||
      "http://localhost:5173";

    return res.redirect(`${front}/auth/oauth-callback?token=${access_token}`);
  }
}
