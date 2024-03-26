import { endOfYesterday, subDays } from "date-fns";

import { metaAdAccountMetricDao } from "#dao/metaAdAccountMetricDao";
import { metaIntegrationDao } from "#dao/metaIntegrationDao";

class Reporter {
  getGeneralDashboardData = async (userId: number) => {
    const metaIntegration =
      await metaIntegrationDao.getMetaIntegrationByUserId(userId);

    const report: {
      spend: {
        [source: string]: {
          value: number;
          date: Date;
        }[];
      };
      users: {
        [source: string]: {
          value: number;
          date: Date;
        }[];
      };
    } = {
      spend: {},
      users: {},
    };

    try {
      if (!metaIntegration) throw new Error("Meta is not integrated");
      if (!metaIntegration.selectedAdAccount)
        throw new Error("Meta ad account not selected");

      const metrics = await metaAdAccountMetricDao.getByPageSince(
        metaIntegration.selectedAdAccount,
        metaIntegration.id,
        subDays(endOfYesterday(), 7 * 4)
      );

      report.spend.meta = [];
      report.users.meta = [];

      for (let i = 0; i < metrics.length; i++) {
        if (metrics[i].metricId === "spend") {
          report.spend.meta.push({
            date: metrics[i].createdAt,
            value: parseFloat(metrics[i].value),
          });
        } else if (metrics[i].metricId === "users") {
          report.spend.users.push({
            date: metrics[i].createdAt,
            value: parseFloat(metrics[i].value),
          });
        }
      }
    } catch (err) {
      /* empty */
    }

    return report;
  };
}

export const reporter = new Reporter();
