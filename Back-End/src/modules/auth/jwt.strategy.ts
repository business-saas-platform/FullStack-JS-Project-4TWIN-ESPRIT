import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(private readonly config: ConfigService) {
    const secret = config.get<string>("JWT_SECRET");

    if (!secret) {
      throw new UnauthorizedException("JWT_SECRET is missing in environment");
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

async validate(payload: any) {
  return {
    sub: payload.sub,              // ✅ keep sub
    id: payload.sub,               // ✅ also keep id (optional)
    email: payload.email,
    role: payload.role,
    businessId: payload.businessId ?? null,
    permissions: payload.permissions ?? [],
  };
}
}