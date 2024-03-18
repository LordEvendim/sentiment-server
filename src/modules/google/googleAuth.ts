import { google } from "googleapis";

import { googleIntegrationDao } from "#dao/googleIntegrationDao";
import { logger } from "#modules/logger";

import { googleAnalytics } from "./googleAnalytics";

// https://developers.google.com/identity/protocols/oauth2/scopes#analytics
// https://developers.google.com/google-ads/api/docs/oauth/internals
const scopes = [
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/adwords",
];

export class GoogleAuth {
  oauthClient;
  authorizationUrl: string;

  constructor() {
    this.oauthClient = new google.auth.OAuth2(
      process.env.GOOGLE_ANALYTICS_CLIENT_ID,
      process.env.GOOGLE_ANALYTICS_CLIENT_SECRET,
      process.env.GOOGLE_ANALYTICS_REDIRECT_URL
    );

    this.authorizationUrl = this.oauthClient.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      include_granted_scopes: true,
    });
  }

  getAuthorizationUrl = () => {
    return this.authorizationUrl;
  };

  createAccessToken = async (code: string, userId: number) => {
    logger.debug(`Google: creating access token for ${userId}`);
    const { tokens } = await this.oauthClient.getToken(code);

    const currentIntegration =
      await googleIntegrationDao.getIntegrationByUserId(userId);

    currentIntegration
      ? await googleIntegrationDao.update(userId, {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenCreatedAt: Date.now(),
        })
      : await googleIntegrationDao.create({
          ownerId: userId,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenCreatedAt: Date.now(),
        });

    await googleAnalytics.connectUserAccounts(userId);

    return tokens.access_token;
  };

  revoke = async () => {};
}

export const googleAuth = new GoogleAuth();
