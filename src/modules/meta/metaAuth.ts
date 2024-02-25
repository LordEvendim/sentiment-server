import axios from "axios";

import { metaIntegrationDao } from "#dao/metaIntegrationDao";
import { metaPageDao } from "#dao/metaPageDao";

import { GetLongLivedToken, GetUserPages } from "./types";

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
    const userIntegration =
      await metaIntegrationDao.getMetaIntegrationByUserId(userId);
    if (userIntegration?.accessToken) return userIntegration?.accessToken;

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

    // update MetaIntegration or create it doesn't exist
    userIntegration
      ? await metaIntegrationDao.update(userId, {
          metaId: metaId,
          accessToken: result.data.access_token,
        })
      : await metaIntegrationDao.create({
          ownerId: userId,
          metaId: metaId,
          accessToken: result.data.access_token,
        });

    // TODO: consider adding to task queue
    await this.getLongLivedPageTokens(userId);

    return result.data.access_token;
  };

  getLongLivedPageTokens = async (userId: number) => {
    const metaIntegration =
      await metaIntegrationDao.getMetaIntegrationByUserId(userId);

    if (!metaIntegration) throw new Error("User has not integrated Meta");

    const userAccessToken = metaIntegration.accessToken;
    const metaId = metaIntegration.metaId;

    const result = await axios.get<GetUserPages>(
      `${this.baseUrl}/${this.apiVersion}/${metaId}/accounts`,
      {
        params: {
          access_token: userAccessToken,
        },
      }
    );

    // get user pages => update or create
    const userPages = await metaPageDao.getUserPages(userId);
    if (!userPages || userPages.length === 0) return;

    const userPagesIds = userPages?.map((page) => page.pageId);

    for (let i = 0; i < result.data.data.length; i++) {
      const { id, access_token, name } = result.data.data[i];

      userPagesIds.includes(id)
        ? metaPageDao.update(id, {
            accessToken: access_token,
            name: name,
          })
        : metaPageDao.create({
            pageId: id,
            accessToken: access_token,
            name: name,
          });
    }

    return result.data.data;
  };
}

export const metaAuth = new MetaAuth();
