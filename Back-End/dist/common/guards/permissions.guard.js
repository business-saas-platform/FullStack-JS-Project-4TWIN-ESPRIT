"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const PERMS_KEY = "required_permissions";
function norm(p) {
    return String(p || "")
        .trim()
        .toLowerCase()
        .replace(":", ".");
}
let PermissionsGuard = class PermissionsGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        const requiredRaw = this.reflector.getAllAndOverride(PERMS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]) || [];
        const required = requiredRaw.map(norm).filter(Boolean);
        if (!required.length)
            return true;
        if (!user)
            throw new common_1.ForbiddenException("Not authenticated");
        if (user.role === "platform_admin")
            return true;
        if (user.role === "business_owner")
            return true;
        const userPermsRaw = Array.isArray(user.permissions)
            ? user.permissions
            : [];
        const userPerms = userPermsRaw.map(norm);
        if (userPerms.includes("*"))
            return true;
        const ok = required.every((p) => userPerms.includes(p));
        if (!ok)
            throw new common_1.ForbiddenException("Missing permissions");
        return true;
    }
};
exports.PermissionsGuard = PermissionsGuard;
exports.PermissionsGuard = PermissionsGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], PermissionsGuard);
//# sourceMappingURL=permissions.guard.js.map