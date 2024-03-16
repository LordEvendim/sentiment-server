import { metaIntegrationDao } from "#dao/metaIntegrationDao";
import { metaPageDao } from "#dao/metaPageDao";
import { reportDao } from "#dao/reportDao";
import { gemini } from "#modules/gemini";
import { GenerativeAi } from "#modules/gemini/types";
import { MetaInsights, metaInsights } from "#modules/meta";

import { prompts } from "./prompts";

class Reporter {
  metaDataProvider: MetaInsights;
  generativeAi: GenerativeAi;

  constructor(generativeAi: GenerativeAi, metaDataProvider: MetaInsights) {
    this.metaDataProvider = metaDataProvider;
    this.generativeAi = generativeAi;
  }

  generateWeeklyPageReport = async (userId: number) => {
    const metaIntegration =
      await metaIntegrationDao.getMetaIntegrationByUserId(userId);

    if (!metaIntegration) throw new Error("User is not connected to Meta");
    if (!metaIntegration.selectedPage)
      throw new Error("User has not selected a page");

    const metaPageInsights = await this.metaDataProvider.getPageInsights(
      userId,
      metaIntegration.selectedPage
    );

    const page = await metaPageDao.getPageByPageId(
      metaIntegration.selectedPage
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
    console.log("Generating report: " + userId);
  };
}

export const reporter = new Reporter(gemini, metaInsights);
