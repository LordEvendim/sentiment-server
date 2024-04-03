import { logger } from "#modules/logger";

import * as dataProviders from "./reporter-data-providers";
import { GeneralDashboardReportData } from "./types";

class Reporter {
  getGeneralDashboardData = async (userId: number) => {
    const report: GeneralDashboardReportData = {
      impressions: {},
      reach: {},
    };

    for (const [providerName, dataProvider] of Object.entries(dataProviders)) {
      logger.debug(`Reporter: getting data from: ${providerName}`);

      await dataProvider.generalReport(userId, report);
    }

    return report;
  };
}

export const reporter = new Reporter();
