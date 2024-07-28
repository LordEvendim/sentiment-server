import { google } from "googleapis";

import { googleIntegrationDao } from "#dao/googleIntegrationDao";
import { logger } from "#modules/logger";

import { googleAds } from "./googleAds";
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
      prompt: "consent",
    });
  }

  getAuthorizationUrl = () => {
    return this.authorizationUrl;
  };

  createAccessToken = async (code: string, userId: number) => {
    logger.debug(`Google: creating access token for ${userId}`);
    const { tokens } = await this.oauthClient.getToken(code);

    await googleIntegrationDao.deleteByUserId(userId);
    await googleIntegrationDao.create({
      ownerId: userId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenCreatedAt: Date.now(),
    });

    await googleAnalytics.connectUserAccounts(userId);
    await googleAds.connectUserAccounts(userId);

    return tokens.access_token;
  };

  revoke = async (userId: number) => {
    logger.debug(`Google: deleting user integration ${userId}`);

    await googleIntegrationDao.deleteByUserId(userId);
  };
}

export const googleAuth = new GoogleAuth();
