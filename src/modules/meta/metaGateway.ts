// https://developers.facebook.com/docs/graph-api/guides/error-handling/
// https://developers.facebook.com/docs/graph-api/overview/rate-limiting
import axios, { AxiosError, AxiosRequestConfig } from "axios";

import { metaApiUsageDao } from "#dao/metaApiUsageDao";
import { metaIntegrationDao } from "#dao/metaIntegrationDao";
import { User } from "#db/schema";
import { logger } from "#modules/logger";

interface MetaCallArgs {
  url: string;
  config: AxiosRequestConfig;
  userId: User["id"];
}

interface MetaBUCCallArgs {
  url: string;
  config: AxiosRequestConfig;
  userId: User["id"];
  businessId: number;
}

interface AppUsageHeader {
  call_count: number;
  total_time: number;
  total_cputime: number;
}

interface MetaErrorData {
  message: string;
  type: string;
  code: number;
  error_subcode: number;
  error_user_title: string;
  error_user_msg: string;
  fbtrace_id: string;
}

class OAuthError {
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}

class RateLimitError {
  nextRequestDate: number;

  constructor(nextRequestDate: number) {
    this.nextRequestDate = nextRequestDate;
  }
}

class UnknownError {
  data: object;

  constructor(requestData: object) {
    this.data = requestData;
  }
}

class InvalidRequestError {
  message: string;

  constructor(messag: string) {
    this.message = messag;
  }
}

class CriticalOperationError {}

const USAGE_THRESHOLD = 90;

class MetaGateway {
  // Graph API
  callGraph = async <T>({ url, config, userId }: MetaCallArgs) => {
    try {
      const result = await axios.get<T>(url, config);

      const appUsage: AppUsageHeader = result.headers["x-app-usage"];
      for (const [, value] of Object.entries(appUsage)) {
        if (value > USAGE_THRESHOLD) {
          logger.warn("Meta Gateway: usage aboce threshold");
        }
      }

      metaApiUsageDao.create({
        callUsage: appUsage.call_count,
        createdAt: new Date(Date.now()),
        source: "meta-insights",
        userId: userId,
      });

      return result;
    } catch (error: unknown) {
      logger.error(error);
      if (!(error instanceof AxiosError)) {
        throw new UnknownError(error as object);
      }

      const response = error.response;

      if (!response) {
        throw new UnknownError(error as object);
      }

      const errorData: MetaErrorData = response.data.error;
      if (!errorData) {
        throw new UnknownError(error);
      }
      logger.error(
        `Meta Gateway: ${errorData?.error_user_title} - ${errorData?.error_user_msg} - ${errorData?.message}`
      );

      // Remove access token or bad request
      // type: OAuthException -> check subcode and remove access token from DB
      if (errorData!.code) {
        throw new OAuthError(errorData.message);
      }

      // Throttle
      // code: 4 -> throttling - wait for the window to end
      // code: 17 -> user throttling - wait for the window to end
      // code: 32 -> throttling - wait for the window to end
      // code: 341 -> app throttlling - wait for the window to end
      if ([4, 17, 32, 341].includes(errorData.code)) {
        const currentDate = Date.now();

        throw new RateLimitError(currentDate.valueOf() + 1000 * 60); // 1 minute
      }

      // Remove access token
      // code: 102 -> check subcode and remove access token from DB
      // code: 10 -> permission denied - remove access token
      // code: 190 -> access token expired - remove access token (generate new using refresh token)
      if ([102, 10, 190].includes(errorData.code)) {
        await metaIntegrationDao
          .updateByUserId(userId, {
            accessToken: null,
          })
          .catch();

        throw new OAuthError(errorData.message);
      }

      // Remove access token
      // code: 200-299 -> permission denied - remove access token
      if (errorData.code >= 200 && errorData.code <= 299) {
        await metaIntegrationDao
          .updateByUserId(userId, {
            accessToken: null,
          })
          .catch();

        throw new OAuthError(errorData.message);
      }

      // Stop all requets
      // *code: 368 -> policies violations
      if (errorData.code === 368) {
        throw new CriticalOperationError();
      }

      if (errorData.code === 100) {
        throw new InvalidRequestError(errorData.message);
      }

      throw new UnknownError(errorData);
    }
  };

  // Business use case API
  callBUC = async <T>({ url, businessId, config, userId }: MetaBUCCallArgs) => {
    try {
      const result = await axios.get<T>(url, config);

      if (result.headers?.["x-business-use-case-usage"]) {
        console.log("inseting");
        const businessUsage = JSON.parse(
          result.headers["x-business-use-case-usage"]
        );
        console.log(businessUsage);

        const usage = businessUsage?.[
          businessId.toString()
        ][0] as AppUsageHeader;
        console.log(usage);
        for (const [, value] of Object.entries(usage)) {
          if (value > USAGE_THRESHOLD) {
            logger.warn("Meta Gateway: usage aboce threshold");
          }
        }

        metaApiUsageDao.create({
          callUsage: usage.call_count,
          createdAt: new Date(Date.now()),
          source: "meta-ads",
          accountId: businessId,
          userId: userId,
        });
      }

      return result;
    } catch (error: unknown) {
      logger.error(error);
      if (!(error instanceof AxiosError)) {
        logger.debug("Meta Gateway: no axios error");
        throw new UnknownError(error as object);
      }

      const response = error.response;

      if (!response) {
        logger.debug("Meta Gateway: no response");
        throw new UnknownError(error as object);
      }

      const errorData: MetaErrorData = response.data.error;
      if (!errorData) {
        logger.debug("Meta Gateway: no error data");
        throw new UnknownError(error);
      }
      logger.error(
        `Meta Gateway: ${errorData?.code} - ${errorData?.error_user_title} - ${errorData?.error_user_msg} - ${errorData?.message}`
      );

      // Remove access token or bad request
      // type: OAuthException -> check subcode and remove access token from DB
      if (!errorData.code) {
        logger.debug("Meta Gateway: no error code");
        throw new OAuthError(errorData.message);
      }

      // Throttle
      // code: 4 -> throttling - wait for the window to end
      // code: 17 -> user throttling - wait for the window to end
      // code: 32 -> throttling - wait for the window to end
      // code: 341 -> app throttlling - wait for the window to end
      if ([4, 17, 32, 341].includes(errorData.code)) {
        logger.debug("Meta Gateway: rate limited");
        const currentDate = Date.now();

        const response = error.response;

        if (!response)
          throw new RateLimitError(currentDate.valueOf() + 1000 * 60); // 1 minute

        if (response.headers?.["x-business-use-case-usage"]) {
          const usage = JSON.parse(
            response.headers["x-business-use-case-usage"]
          )?.[businessId.toString()]?.[0] as AppUsageHeader & {
            estimated_time_to_regain_access: number;
          };

          metaApiUsageDao.create({
            callUsage: usage.call_count,
            createdAt: new Date(Date.now()),
            source: "meta-ads",
            accountId: businessId,
            userId: userId,
          });

          throw new RateLimitError(
            currentDate.valueOf() + 1000 * usage.estimated_time_to_regain_access
          );
        }

        throw new RateLimitError(currentDate.valueOf() + 1000 * 60); // 1 minute
      }

      // Remove access token
      // code: 102 -> check subcode and remove access token from DB
      // code: 10 -> permission denied - remove access token
      // code: 190 -> access token expired - remove access token (generate new using refresh token)
      if ([102, 10, 190].includes(errorData.code)) {
        logger.debug("Meta Gateway: remove access token");
        await metaIntegrationDao
          .updateByUserId(userId, {
            accessToken: null,
          })
          .catch();

        throw new OAuthError(errorData.message);
      }

      // Remove access token
      // code: 200-299 -> permission denied - remove access token
      if (errorData.code >= 200 && errorData.code <= 299) {
        logger.debug("Meta Gateway: remove access token 2");
        await metaIntegrationDao
          .updateByUserId(userId, {
            accessToken: null,
          })
          .catch();

        throw new OAuthError(errorData.message);
      }

      // Stop all requets
      // *code: 368 -> policies violations
      if (errorData.code === 368) {
        logger.debug("Meta Gateway: critical error");
        throw new CriticalOperationError();
      }

      if (errorData.code === 100) {
        logger.debug("Meta Gateway: invalid request");
        throw new InvalidRequestError(errorData.message);
      }

      logger.debug("Meta Gateway: unknown error");
      throw new UnknownError(errorData);
    }
  };
}

export const metaGateway = new MetaGateway();
