import { google } from "googleapis";

// https://developers.google.com/identity/protocols/oauth2/scopes#analytics
const scopes = ["https://www.googleapis.com/auth/analytics.readonly"];

export class GoogleAnalytics {
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

  setToken = async (token: string, userId: string) => {};

  revoke = async () => {};
}
