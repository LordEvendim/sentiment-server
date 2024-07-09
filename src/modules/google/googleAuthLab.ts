// https://www.npmjs.com/package/google-auth-library
import { OAuth2Client } from "google-auth-library";

import { googleIntegrationDao } from "#dao/googleIntegrationDao";
import { logger } from "#modules/logger";

// https://developers.google.com/identity/protocols/oauth2/scopes#analytics
// https://developers.google.com/google-ads/api/docs/oauth/internals
const scopes = [
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/adwords",
];
/**
 * this would try to authenticate the user with google and handle the access token refresh token and all the other stuff
 *
 * at this point i want to create a instance per userId so we could handle the request by user instead of make some messy implementation
 *
 */
export default class GoogleAuthLab {
  oAuth2Client: OAuth2Client;

  request: typeof OAuth2Client.prototype.request;

  constructor(
    /**
     * this instance would be related to the user
     */
    public readonly userId: number
  ) {
    this.oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_ANALYTICS_CLIENT_ID,
      process.env.GOOGLE_ANALYTICS_CLIENT_SECRET,
      process.env.GOOGLE_ANALYTICS_REDIRECT_URL
    );

    /**
     * manage the logic to refresh the access token
     */
    this.setRefreshTokenSave();

    // Make a simple request to the People API using our pre-authenticated client. The `request()` method
    // takes an GaxiosOptions object.  Visit https://github.com/JustinBeckwith/gaxios.
    this.request = this.oAuth2Client.request.bind(this.oAuth2Client);
  }

  setRefreshTokenSave() {
    /**
     * we override he refresh token part with a wrapper to save the refresh token whenever it gets update by the library
     */
    const originalRefreshToken = this.oAuth2Client.refreshAccessToken.bind(
      this.oAuth2Client
    );

    /**
     *  in out implmentation we only add the method to save the tokens on the db
     */
    this.oAuth2Client.refreshAccessToken = async () => {
      const result = await originalRefreshToken();
      const tokens = result.credentials;

      if (tokens.access_token) {
        await googleIntegrationDao.saveTokens(this.userId, tokens);
      }

      return result;
    };
    /**
     * with this we could get the refresh token whenever it gets updated )
     */
    this.oAuth2Client.on("tokens", async (tokens) => {
      if (tokens.refresh_token) {
        await googleIntegrationDao.saveTokens(this.userId, tokens);
      }
    });
  }

  /**
   * on interaction we want to send the user a authorized url so we could get the "code" later
   */
  static async getAuthorizedUrl() {
    const client = new OAuth2Client(
      process.env.GOOGLE_ANALYTICS_CLIENT_ID,
      process.env.GOOGLE_ANALYTICS_CLIENT_SECRET,
      process.env.GOOGLE_ANALYTICS_REDIRECT_URL
    );
    const authorizeUrl = client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      include_granted_scopes: true,
      prompt: "consent",
    });

    return authorizeUrl;
  }

  /**
   * this would create an access token
   */
  async generateOAuthTokens(code: string) {
    const { tokens } = await this.oAuth2Client.getToken(code);

    console.log(tokens);

    this.oAuth2Client.setCredentials(tokens);

    await googleIntegrationDao.saveTokens(this.userId, tokens);

    return tokens;
  }

  /**
   * we load the existant credentials to use, if theres no one we are unauthenticated so we would get and exception
   */
  async loadTokens() {
    const credentials = await googleIntegrationDao.loadTokens(this.userId);

    if (credentials) {
      this.oAuth2Client.setCredentials(credentials);
    }

    if (!credentials) {
      const tokens = await this.refreshAccessToken();

      if (tokens) {
        this.oAuth2Client.setCredentials(tokens);
        return tokens;
      }
    }

    return credentials;
  }
  /**
   * this should be the one that needs to be refreshed
   *
   * according to the usual implementation of access ~ refresh token
   *
   * we should always refresh the access token
   *
   * if the refresh token is expired we are out of luck
   *
   * because it only is refreshed when the user interacts with the app calling the this.getTokens method
   */
  async refreshAccessToken() {
    try {
      const { credentials } = await this.oAuth2Client.refreshAccessToken();

      return credentials;
    } catch (err) {
      const error = err as Error;
      /**
       * https://googleapis.dev/nodejs/google-auth-library/5.5.0/classes/OAuth2Client.html#source
       *
       * according to the documentation the error message is "Could not refresh access token." so i think we could use it to identify the error
       *
       * if the errir is this one we should remove the tokens from the db and the user would need to reauthenticate
       */
      if (error.message === "Could not refresh access token.") {
        await googleIntegrationDao.deleteByUserId(this.userId);
        return null;
      }

      logger.error("Google Auth Lab: error refreshing token", error);
      return null;
    }
  }
}
