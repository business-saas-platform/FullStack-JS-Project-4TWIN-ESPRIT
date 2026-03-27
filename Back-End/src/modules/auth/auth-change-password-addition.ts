// ─────────────────────────────────────────────────────────
// ADD THIS TO auth.service.ts
// ─────────────────────────────────────────────────────────

// Change password (authenticated, requires current password)


// ─────────────────────────────────────────────────────────
// ADD THIS DTO — change-password.dto.ts (if not exists)
// ─────────────────────────────────────────────────────────
// import { IsString, IsNotEmpty } from 'class-validator';
// export class ChangePasswordDto {
//   @IsString() @IsNotEmpty()
//   currentPassword!: string;
//
//   @IsString() @IsNotEmpty()
//   newPassword!: string;
// }


// ─────────────────────────────────────────────────────────
// ADD THIS TO auth.controller.ts
// ─────────────────────────────────────────────────────────

// @UseGuards(JwtAuthGuard)
// @Post("change-password")
// changePassword(@Req() req: any, @Body() dto: { currentPassword: string; newPassword: string }) {
//   return this.authService.changePassword(req.user.sub, dto.currentPassword, dto.newPassword);
// }
