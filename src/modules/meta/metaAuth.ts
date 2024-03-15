import axios from "axios";

import { metaIntegrationDao } from "#dao/metaIntegrationDao";
import { metaPageDao } from "#dao/metaPageDao";
import { NewMetaPage } from "#db/schema";

import { metaInsights } from "./metaInsights";
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

    await metaIntegrationDao.create({
      ownerId: userId,
      metaId: metaId,
      accessToken: result.data.access_token,
    });

    // TODO: move to connect function like in ad accounts
    await this.getLongLivedPageTokens(userId);
    await metaInsights.connectUserAdAccounts(userId);

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

    const transformedPages: NewMetaPage[] = result.data.data.map((page) => ({
      pageId: parseInt(page.id),
      accessToken: page.access_token,
      integrationId: metaIntegration.id,
      name: page.name,
    }));

    await metaPageDao.createMany(transformedPages);

    return result.data.data;
  };
}

export const metaAuth = new MetaAuth();
