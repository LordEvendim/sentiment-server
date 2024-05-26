import { addWeeks, isWithinInterval, subWeeks } from "date-fns";

import { reportDao } from "#dao/reportDao";
import { NewReport, Report } from "#db/schema";
import { gemini } from "#modules/gemini";
import { GenerativeAi } from "#modules/gemini/types";
import { logger } from "#modules/logger";
import { MetaInsights, metaInsights } from "#modules/meta";

import { reporter } from "./reporter";
import { ReportMetricSource } from "./types";

class GenerativeReporter {
  metaDataProvider: MetaInsights;
  generativeAi: GenerativeAi;

  constructor(generativeAi: GenerativeAi, metaDataProvider: MetaInsights) {
    this.metaDataProvider = metaDataProvider;
    this.generativeAi = generativeAi;
  }

  getWeeklyPageReport = async (userId: number) => {
    const report = await reportDao.getByUserId(userId);

    return report;
  };

  generateWeeklyReport = async (
    userId: number
  ): Promise<Report | undefined> => {
    let input = "Give recommendations and insights \n\n";

    const data = await reporter.getLast4WeeksOverviewReportData(userId);

    const usedSources = new Set<ReportMetricSource>();
    for (let i = 0; i < data.length; i++) {
      usedSources.add(data[i].source);
    }

    const firstWeek = subWeeks(Date.now(), 4);

    for (const source of usedSources.values()) {
      input += `////// ${source
        .split("-")
        .map((s) => s[0].toUpperCase() + s.slice(1))
        .join(" ")} \n`;

      let currentWeek = firstWeek;

      for (let i = 0; i < 4; i++) {
        input += `Week ${i + 1}\n`;

        const weekMetrics = [...data]
          .filter((datapoint) => datapoint.source === source)
          .filter((d) =>
            isWithinInterval(d.createdAt, {
              start: currentWeek,
              end: addWeeks(currentWeek, 1),
            })
          );

        const metricsMap = new Map<string, number>();

        for (let j = 0; j < weekMetrics.length; j++) {
          const currentMetricValue = metricsMap.get(weekMetrics[j].metricId);
          const metricId = weekMetrics[j].metricId;

          metricsMap.set(
            metricId,
            currentMetricValue === undefined
              ? weekMetrics[j].value
              : currentMetricValue + weekMetrics[j].value
          );
        }

        for (const [key, value] of metricsMap) {
          input += `${key} - ${value.toFixed(2)} \n`;
        }

        input += "\n\n";
        currentWeek = addWeeks(currentWeek, 1);
      }

      input += "\n";
    }

    logger.debug("Generative Reporter: generating report");
    const response = await gemini.getTextResponse(input);

    const newReport = {
      createdAd: Date.now(),
      data: response,
      ownerId: userId,
      period: 7,
    } satisfies NewReport;

    logger.debug("Generative Reporter: inserting result");
    const insertData = await reportDao.create(newReport);

    return {
      reportId: insertData[0].insertId,
      ...newReport,
    };
  };
}

export const generativeReporter = new GenerativeReporter(gemini, metaInsights);
