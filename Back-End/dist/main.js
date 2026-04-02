"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const path_1 = require("path");
function parseCorsOrigins(value) {
    if (!value)
        return ["http://localhost:5173", "http://localhost:3000"];
    return value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: parseCorsOrigins(process.env.CORS_ORIGINS),
        credentials: true,
    });
    app.setGlobalPrefix("api");
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.useStaticAssets((0, path_1.join)(process.cwd(), "uploads"), {
        prefix: "/uploads",
    });
    await app.listen(Number(process.env.PORT || 3000));
}
bootstrap();
//# sourceMappingURL=main.js.map