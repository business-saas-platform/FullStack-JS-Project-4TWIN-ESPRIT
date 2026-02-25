import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Param,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { BusinessAccessGuard } from "../../common/guards/business-access.guard";

function safeExt(filename: string) {
  return extname(filename || "").toLowerCase();
}

@Controller("businesses")
@UseGuards(JwtAuthGuard, BusinessAccessGuard)
export class BusinessFilesController {
  @Post(":id/logo")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads/logos",
        filename: (_req: any, file: { originalname: string; }, cb: (arg0: null, arg1: string) => void) => {
          const ext = safeExt(file.originalname);
          const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
          cb(null, name);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const ok = ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype);
        cb(ok ? null : new BadRequestException("Only PNG/JPG/WEBP allowed"), ok);
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    })
  )
  uploadLogo(@Param("id") businessId: string, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException("File is required");

    // URL public (on va servir /uploads en static)
    const logoUrl = `/uploads/logos/${file.filename}`;

    return { businessId, logoUrl };
  }
}