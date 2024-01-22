import axios from "axios";

class MetaAuth {
  apiVersion = "v18.0";
  baseUrl = "https://graph.facebook.com/";
  appSecret = "";
  appId = "";

  constructor() {
    this.appSecret = process.env.META_APP_SECRET ?? "";
    this.appId = process.env.META_APP_ID ?? "";
  }

  getLongLivedToken = async (userAccessToken: string) => {
    const result = await axios.get<{
      access_token: string;
      token_type: "bearer";
      expires_in: number;
    }>(`${this.baseUrl}/${this.apiVersion}/oauth/access_token`, {
      params: {
        grant_type: "fb_exchange_token",
        client_id: this.appId,
        client_secret: this.appSecret,
        fb_exchange_token: userAccessToken,
      },
    });

    return result.data.access_token;
  };

  getLongLivedPageTokens = async (
    userId: string,
    userLongLivedToken: string
  ) => {
    const result = await axios.get<{
      data: Array<{
        access_token: string;
        category: string;
        category_list: [
          {
            id: string;
            name: string;
          },
        ];
        name: string;
        id: string;
        tasks: string[];
      }>;
      paging: {
        cursors: {
          before: string;
          after: string;
        };
      };
    }>(`${this.baseUrl}/${this.apiVersion}/${userId}/accounts`, {
      params: {
        access_token: userLongLivedToken,
      },
    });

    return result.data.data;
  };
}

export const metaAuth = new MetaAuth();
