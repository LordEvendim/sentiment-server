import { gemini } from "#modules/gemini";
import { GenerativeAi } from "#modules/gemini/types";
import { MetaInsights, metaInsights } from "#modules/meta";
import { pages } from "#modules/meta/tempStorage";

import { prompts } from "./prompts";
import { weeklyPageReports } from "./tempStorage";

class Reporter {
  metaDataProvider: MetaInsights;
  generativeAi: GenerativeAi;

  constructor(generativeAi: GenerativeAi, metaDataProvider: MetaInsights) {
    this.metaDataProvider = metaDataProvider;
    this.generativeAi = generativeAi;
  }

  generateWeeklyPageReport = async (userId: number, pageId: number) => {
    const metaPageInsights = await this.metaDataProvider.getPageInsights(
      userId,
      pageId
    );

    const pageName = pages[pageId].name;

    const report = await this.generativeAi.getTextResponse(
      prompts.getPageInsightsPrompt(pageName, "week") +
        JSON.stringify(metaPageInsights)
    );

    weeklyPageReports[pageId] = report;

    return report;
  };

  getWeeklyPageReport = async (userId: number, pageId: number) => {
    const metaPageInsights = await this.metaDataProvider.getPageInsights(
      userId,
      pageId
    );

    const pageName = pages[pageId].name;

    const report = await this.generativeAi.getTextResponse(
      prompts.getPageInsightsPrompt(pageName, "week") +
        JSON.stringify(metaPageInsights)
    );

    weeklyPageReports[pageId] = report;

    return report;
  };
}

export const reporter = new Reporter(gemini, metaInsights);
