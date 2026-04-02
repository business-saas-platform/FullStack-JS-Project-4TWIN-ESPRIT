"use strict";
async;
changePassword(userId, string, currentPassword, string, newPassword, string);
{
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user)
        throw new UnauthorizedException();
    if (!user.passwordHash)
        throw new BadRequestException("No password set. Use OAuth login.");
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok)
        throw new UnauthorizedException("Current password is incorrect.");
    if (!this.isStrongPassword(newPassword)) {
        throw new BadRequestException("Weak password (need 1 uppercase, 1 lowercase, 1 number, min 8)");
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    await this.users.save(user);
    return { ok: true, message: "Password changed successfully." };
}
//# sourceMappingURL=auth-change-password-addition.js.map