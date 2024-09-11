import axios from "axios";

import { metaIntegrationDao } from "#dao/metaIntegrationDao";
import { logger } from "#modules/logger";

import { metaAds } from "./metaAds";
import { metaInsights } from "./metaInsights";
import { GetLongLivedToken } from "./types";

class MetaAuth {
  apiVersion = "v20.0";
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
    logger.debug("Meta: creating access token for " + userId);
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

    await metaIntegrationDao.deleteByUserId(userId);
    await metaIntegrationDao.create({
      ownerId: userId,
      metaId: metaId,
      accessToken: result.data.access_token,
    });

    // TODO: move to connect function like in ad accounts
    await metaInsights.connectPages(userId);
    await metaAds.connectUserAdAccounts(userId);

    return result.data.access_token;
  };

  getUserBusinesses = async (userId: number) => {
    logger.debug(`Meta: getting user Meta businesses ${userId}`);
    const metaIntegration =
      await metaIntegrationDao.getIntegrationByUserId(userId);

    if (!metaIntegration) throw new Error("Meta: user not connected");

    const result = await axios.get<{
      data: {
        id: string;
        name: string;
      }[];
    }>(
      `${this.baseUrl}/${this.apiVersion}/${metaIntegration.metaId}/businesses`,
      {
        params: {
          access_token: metaIntegration.accessToken,
        },
      }
    );

    return result.data.data;
  };

  revoke = async (userId: number) => {
    logger.debug(`Meta: deleting user integration ${userId}`);

    await metaIntegrationDao.deleteByUserId(userId);
  };
}

export const metaAuth = new MetaAuth();
