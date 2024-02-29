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

  createAccessToken = async (
    userId: number,
    metaId: string,
    userAccessToken: string
  ) => {
    console.log("getting llat");
    const userIntegration =
      await metaIntegrationDao.getMetaIntegrationByUserId(userId);

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

    // TODO: replace with upsert
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
    console.log("getLongLivedPageTokens");
    const metaIntegration =
      await metaIntegrationDao.getMetaIntegrationByUserId(userId);

    console.log("1");
    if (!metaIntegration) throw new Error("User has not integrated Meta");
    console.log("2");

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
    console.log("3");

    // get user pages => update or create
    const userPages = await metaPageDao.getUserPages(userId);
    console.log("4");

    const userPagesIds = userPages?.map((page) => page.pageId) ?? [];

    console.log(userPagesIds);

    for (let i = 0; i < result.data.data.length; i++) {
      const { id, access_token, name } = result.data.data[i];
      const parsedId = parseInt(id);

      console.log(parsedId);
      console.log(typeof parsedId);

      userPagesIds.includes(parsedId)
        ? metaPageDao.update(parsedId, {
            accessToken: access_token,
            name: name,
          })
        : metaPageDao.create({
            pageId: parsedId,
            accessToken: access_token,
            integrationId: metaIntegration.id,
            name: name,
          });
    }
    console.log("5");

    return result.data.data;
  };
}

export const metaAuth = new MetaAuth();
