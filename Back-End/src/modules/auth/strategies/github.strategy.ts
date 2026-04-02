import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-github2";

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, "github") {
  constructor(private config: ConfigService) {
    super({
      clientID: config.get<string>("GITHUB_CLIENT_ID"),
      clientSecret: config.get<string>("GITHUB_CLIENT_SECRET"),
      callbackURL: config.get<string>("GITHUB_CALLBACK_URL"),
      scope: ["user:email"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ) {
    // profile contient github id, username, photos...
    const email =
      (profile.emails && profile.emails[0]?.value) || null;

    return {
      provider: "github",
      providerId: profile.id,
      username: profile.username,
      email,
      avatar: profile.photos?.[0]?.value,
    };
  }
}
