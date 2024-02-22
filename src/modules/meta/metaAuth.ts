import axios from "axios";

import {
  businesses,
  pages,
  userBusinesses,
  userMetaId,
  userPages,
  userTokens,
} from "./tempStorage";
import { GetLongLivedToken, GetUserAccounts } from "./types";

class MetaAuth {
  apiVersion = "v18.0";
  baseUrl = "https://graph.facebook.com";
  appSecret: string;
  appId: string;

  constructor() {
    this.appSecret = process.env.META_APP_SECRET ?? "";
    this.appId = process.env.META_APP_ID ?? "";
  }

  getLongLivedToken = async (
    userId: number,
    metaId: string,
    userAccessToken: string
  ) => {
    if (userTokens[userId]) return userTokens[userId];
    userMetaId[userId] = metaId;

    const result = await axios.get<GetLongLivedToken>(
      `${this.baseUrl}/${this.apiVersion}/oauth/access_token`,
      {
        params: {
          grant_type: "fb_exchange_token",
          client_id: this.appId,
          client_secret: this.appSecret,
          fb_exchange_token: userAccessToken,
        },
      }
    );

    userTokens[userId] = result.data.access_token;

    await this.getLongLivedPageTokens(userId);

    return result.data.access_token;
  };

  getLongLivedPageTokens = async (userId: number) => {
    const userAccessToken = userTokens[userId];
    const metaId = userMetaId[userId];

    if (!metaId) throw new Error("User is not connected to meta");

    const result = await axios.get<GetUserAccounts>(
      `${this.baseUrl}/${this.apiVersion}/${metaId}/accounts`,
      {
        params: {
          access_token: userAccessToken,
        },
      }
    );

    for (let i = 0; i < result.data.data.length; i++) {
      const { id, access_token, name } = result.data.data[i];

      pages[id] = {
        accessToken: access_token,
        name,
      };
    }
    userPages[userId] = result.data.data.map((page) => page.id);

    return result.data.data;
  };

  getUserBusinesses = async (userId: string) => {
    const userAccessToken = userTokens[userId];

    const metaUserId = userMetaId[userId];

    if (!metaUserId) throw new Error("User is not connected wiht Meta");

    const result = await axios.get<GetUserAccounts>(
      `${this.baseUrl}/${this.apiVersion}/${metaUserId}/businesses`,
      {
        params: {
          access_token: userAccessToken,
        },
      }
    );

    for (let i = 0; i < result.data.data.length; i++) {
      const { id, name } = result.data.data[i];

      businesses[id] = {
        name,
      };
    }
    userBusinesses[userId] = result.data.data.map((business) => business.id);

    return result.data.data;
  };
}

export const metaAuth = new MetaAuth();
