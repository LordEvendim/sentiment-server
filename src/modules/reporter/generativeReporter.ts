import { endOfYesterday, subDays } from "date-fns";

import { metaIntegrationDao } from "#dao/metaIntegrationDao";
import { metaPageDao } from "#dao/metaPageDao";
import { reportDao } from "#dao/reportDao";
import { gemini } from "#modules/gemini";
import { GenerativeAi } from "#modules/gemini/types";
import { logger } from "#modules/logger";
import { MetaInsights, metaInsights } from "#modules/meta";

import { prompts } from "./prompts";

class GenerativeReporter {
  metaDataProvider: MetaInsights;
  generativeAi: GenerativeAi;

  constructor(generativeAi: GenerativeAi, metaDataProvider: MetaInsights) {
    this.metaDataProvider = metaDataProvider;
    this.generativeAi = generativeAi;
  }

  generateWeeklyPageReport = async (userId: number) => {
    const metaIntegration =
      await metaIntegrationDao.getIntegrationByUserId(userId);

    if (!metaIntegration) throw new Error("User is not connected to Meta");
    if (!metaIntegration.selectedPage)
      throw new Error("User has not selected a page");

    const metaPageInsights = await this.metaDataProvider.getPageInsights(
      userId,
      metaIntegration.selectedPage,
      subDays(endOfYesterday(), 7),
      endOfYesterday()
    );

    const page = await metaPageDao.getPage(
      metaIntegration.selectedPage,
      metaIntegration.id
    );

    if (!page) throw new Error("Page doesn't exist");

    const report = await this.generativeAi.getTextResponse(
      prompts.getPageInsightsPrompt(page.pageId.toString(), "week") +
        JSON.stringify(metaPageInsights)
    );

    await reportDao.create({
      createdAd: Date.now(),
      data: report,
      ownerId: userId,
    });

    return report;
  };

  getWeeklyPageReport = async (userId: number) => {
    const report = await reportDao.getByUserId(userId);

    return report;
  };

  generateWeeklyReport = async (userId: number) => {
    logger.info(`Reporter: Generating weekly report for ${userId}`);
  };
}

export const generativeReporter = new GenerativeReporter(gemini, metaInsights);
