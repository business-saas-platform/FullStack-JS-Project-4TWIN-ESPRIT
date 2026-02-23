// src/modules/auth/auth.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { UserEntity } from "../users/entities/user.entity";
import { TeamInvitationEntity } from "../team-members/entities/team-invitation.entity";
import { TeamMemberEntity } from "../team-members/entities/team-member.entity";

// + GoogleStrategy / GithubStrategy si tu les as
import { GoogleStrategy } from "./google.strategy";
import { GithubStrategy } from "./github.strategy";

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ session: false }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "7d" },
      }),
    }),

    TypeOrmModule.forFeature([UserEntity, TeamInvitationEntity, TeamMemberEntity]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, GithubStrategy],
  exports: [AuthService],
})
export class AuthModule {}
