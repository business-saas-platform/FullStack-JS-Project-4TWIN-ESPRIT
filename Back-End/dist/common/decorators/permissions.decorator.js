"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequirePermissions = exports.PERMS_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.PERMS_KEY = "required_permissions";
const RequirePermissions = (...permissions) => (0, common_1.SetMetadata)(exports.PERMS_KEY, permissions);
exports.RequirePermissions = RequirePermissions;
//# sourceMappingURL=permissions.decorator.js.map