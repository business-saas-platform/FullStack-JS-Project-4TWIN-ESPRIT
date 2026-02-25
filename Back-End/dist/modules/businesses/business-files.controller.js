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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessFilesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const business_access_guard_1 = require("../../common/guards/business-access.guard");
function safeExt(filename) {
    return (0, path_1.extname)(filename || "").toLowerCase();
}
let BusinessFilesController = class BusinessFilesController {
    uploadLogo(businessId, file) {
        if (!file)
            throw new common_1.BadRequestException("File is required");
        const logoUrl = `/uploads/logos/${file.filename}`;
        return { businessId, logoUrl };
    }
};
exports.BusinessFilesController = BusinessFilesController;
__decorate([
    (0, common_1.Post)(":id/logo"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file", {
        storage: (0, multer_1.diskStorage)({
            destination: "./uploads/logos",
            filename: (_req, file, cb) => {
                const ext = safeExt(file.originalname);
                const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
                cb(null, name);
            },
        }),
        fileFilter: (_req, file, cb) => {
            const ok = ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype);
            cb(ok ? null : new common_1.BadRequestException("Only PNG/JPG/WEBP allowed"), ok);
        },
        limits: { fileSize: 2 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BusinessFilesController.prototype, "uploadLogo", null);
exports.BusinessFilesController = BusinessFilesController = __decorate([
    (0, common_1.Controller)("businesses"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, business_access_guard_1.BusinessAccessGuard)
], BusinessFilesController);
//# sourceMappingURL=business-files.controller.js.map