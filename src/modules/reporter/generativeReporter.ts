import { addWeeks, isWithinInterval, parse, subWeeks } from "date-fns";

import { metricReportDao } from "#dao/metricReportDao";
import { reportDao } from "#dao/reportDao";
import { userDao } from "#dao/userDao";
import { NewReport, Report } from "#db/schema";
import { NewMetricReport } from "#db/schema/MetricReports";
import { gemini } from "#modules/gemini";
import { GenerativeAi } from "#modules/gemini/types";
import { googleAds } from "#modules/google/googleAds";
import { logger } from "#modules/logger";
import { MetaInsights, metaInsights } from "#modules/meta";
import { metaAds } from "#modules/meta/metaAds";

import { metricReportConfigs } from "./metrics";
import { prompts } from "./prompts";
import { reporter } from "./reporter";
import { calculateTimeframeStart, DashboardTimeframe } from "./timeframes";
import { ReportMetricSource } from "./types";

class GenerativeReporter {
  metaDataProvider: MetaInsights;
  generativeAi: GenerativeAi;

  constructor(generativeAi: GenerativeAi, metaDataProvider: MetaInsights) {
    this.metaDataProvider = metaDataProvider;
    this.generativeAi = generativeAi;
  }

  getMetricReport = async (
    userId: number,
    name: string,
    timeframe: DashboardTimeframe,
    until: string
  ) => {
    const untilDate = parse(until, "yyyyMMdd", Date.now());

    const lastReport =
      await metricReportDao.getLatestByUserIdTimeframeAndTimeframe(
        userId,
        timeframe,
        name
      );

    if (!lastReport || lastReport.until < untilDate)
      return await this.generateMetricReport(userId, name, timeframe, until);

    return lastReport;
  };

  generateMetricReport = async (
    userId: number,
    name: string,
    timeframe: DashboardTimeframe,
    until: string
  ) => {
    const untilDate = parse(until, "yyyyMMdd", Date.now());
    const sinceDate = calculateTimeframeStart(untilDate, timeframe);
    const compareSinceDate = calculateTimeframeStart(sinceDate, timeframe);
    const reportConfig =
      metricReportConfigs[name] ?? metricReportConfigs["clicks"];

    // data
    let prompt = "";

    if (reportConfig.type === "cumulative") {
      const data = await reporter.getDataSumGroupBySources(
        userId,
        reportConfig.metrics,
        sinceDate
      );
      const compareData = await reporter.getDataSumGroupBySources(
        userId,
        reportConfig.metrics,
        compareSinceDate
      );

      const googleCampaigns = await googleAds.getTopCampaigns(
        userId,
        sinceDate
      );
      const metaCampaigns = await metaAds.getTopCampaigns(userId, sinceDate);

      const googleCampaignsCompare = await googleAds.getCampaigns(
        userId,
        compareSinceDate,
        sinceDate
      );
      const metaCampaignsCompare = await metaAds.getCampaigns(
        userId,
        compareSinceDate,
        sinceDate
      );

      prompt = `
        ${reportConfig.prompt}
      
        Last time period:
        ${Object.entries(compareData)
          .map(
            ([source, value]) =>
              `${source.replace("-", " ")}: ${(
                value - (data[source] ?? 0)
              ).toFixed(0)}`
          )
          .join("\n")}
        Current time period:
        ${Object.entries(data)
          .map(
            ([source, value]) =>
              `${source.replace("-", " ")}: ${value.toFixed(0)}`
          )
          .join("\n")}
      
        Campaigns:
        Last time period:
        Meta:
        ${metaCampaignsCompare
          .map(
            (campaign) =>
              `${campaign.name}: ${parseInt(
                campaign[
                  reportConfig.campaignMetrics
                    .meta as keyof (typeof metaCampaignsCompare)[0]
                ] as string
              ).toFixed(0)}`
          )
          .join("\n")}
        Google:
        ${googleCampaignsCompare
          .map(
            (campaign) =>
              `${campaign.name}: ${parseInt(
                campaign[
                  reportConfig.campaignMetrics
                    .google as keyof (typeof googleCampaignsCompare)[0]
                ] as string
              ).toFixed(0)}`
          )
          .join("\n")}

        Current time period:
        Meta:
        ${metaCampaigns
          .map(
            (campaign) =>
              `${campaign.name}: ${parseInt(
                campaign[
                  reportConfig.campaignMetrics
                    .meta as keyof (typeof metaCampaigns)[0]
                ] as string
              ).toFixed(0)}`
          )
          .join("\n")}
        Google:
        ${googleCampaigns
          .map(
            (campaign) =>
              `${campaign.name}: ${parseInt(
                campaign[
                  reportConfig.campaignMetrics
                    .google as keyof (typeof googleCampaigns)[0]
                ] as string
              ).toFixed(0)}`
          )
          .join("\n")}
        `;
    } else {
      const dataDivisor = await reporter.getDataSumGroupBySources(
        userId,
        reportConfig.divisorMetrics,
        sinceDate
      );
      const compareDataDivisor = await reporter.getDataSumGroupBySources(
        userId,
        reportConfig.divisorMetrics,
        compareSinceDate
      );
      const dataDivident = await reporter.getDataSumGroupBySources(
        userId,
        reportConfig.dividentMetrics,
        sinceDate
      );
      const compareDataDivident = await reporter.getDataSumGroupBySources(
        userId,
        reportConfig.dividentMetrics,
        compareSinceDate
      );

      const googleCampaigns = await googleAds.getTopCampaigns(
        userId,
        sinceDate
      );
      const metaCampaigns = await metaAds.getTopCampaigns(userId, sinceDate);

      const googleCampaignsCompare = await googleAds.getCampaigns(
        userId,
        compareSinceDate,
        sinceDate
      );
      const metaCampaignsCompare = await metaAds.getCampaigns(
        userId,
        compareSinceDate,
        sinceDate
      );

      prompt = `
        ${reportConfig.prompt}
      
        Last time period:
        ${Object.entries(compareDataDivisor)
          .map(
            ([source, value]) =>
              `${source.replace("-", " ")}: ${(
                (compareDataDivident[source] - dataDivident[source]) /
                (value - dataDivisor[source])
              ).toFixed(2)}`
          )
          .join("\n")}
        Current time period:
        ${Object.entries(dataDivisor)
          .map(
            ([source, value]) =>
              `${source.replace("-", " ")}: ${(
                dataDivident[source] / value
              ).toFixed(2)}`
          )
          .join("\n")}
      
        Campaigns:
                Last time period:
        Meta:
        ${metaCampaignsCompare
          .map((campaign) => {
            const divident =
              (campaign[
                reportConfig.campaignMetrics.divident
                  .meta as keyof (typeof metaCampaigns)[0]
              ] as number) ?? 0;
            const divisor =
              (campaign[
                reportConfig.campaignMetrics.divisor
                  .meta as keyof (typeof metaCampaigns)[0]
              ] as number) ?? 0;

            return `${campaign.name}: ${(divident / divisor).toFixed(2)}`;
          })
          .join("\n")}
        Google:
        ${googleCampaignsCompare
          .map((campaign) => {
            const divident =
              (campaign[
                reportConfig.campaignMetrics.divident
                  .google as keyof (typeof googleCampaigns)[0]
              ] as number) ?? 0;
            const divisor =
              (campaign[
                reportConfig.campaignMetrics.divisor
                  .google as keyof (typeof googleCampaigns)[0]
              ] as number) ?? 0;

            return `${campaign.name}: ${(divident / divisor).toFixed(2)}`;
          })
          .join("\n")}

        Current time period:
        Meta:
        ${metaCampaigns
          .map((campaign) => {
            const divident =
              (campaign[
                reportConfig.campaignMetrics.divident
                  .meta as keyof (typeof metaCampaigns)[0]
              ] as number) ?? 0;
            const divisor =
              (campaign[
                reportConfig.campaignMetrics.divisor
                  .meta as keyof (typeof metaCampaigns)[0]
              ] as number) ?? 0;

            return `${campaign.name}: ${(divident / divisor).toFixed(2)}`;
          })
          .join("\n")}
        Google:
        ${googleCampaigns
          .map((campaign) => {
            const divident =
              (campaign[
                reportConfig.campaignMetrics.divident
                  .google as keyof (typeof googleCampaigns)[0]
              ] as number) ?? 0;
            const divisor =
              (campaign[
                reportConfig.campaignMetrics.divisor
                  .google as keyof (typeof googleCampaigns)[0]
              ] as number) ?? 0;

            return `${campaign.name}: ${(divident / divisor).toFixed(2)}`;
          })
          .join("\n")}
        `;

      console.log(prompt);
    }

    // generate
    const insights = await gemini.getFlashTextResponse(prompt);

    // save
    const newReport = {
      name,
      createdAt: new Date(Date.now()),
      data: insights,
      ownerId: userId,
      timeframe,
      until: untilDate,
    } satisfies NewMetricReport;
    await metricReportDao.create(newReport);

    return newReport;
  };

  getReport = async (userId: number, timeframe: string) => {
    const report = await reportDao.getLatestByUserIdAndTimeframe(
      userId,
      timeframe
    );

    return report;
  };

  generateReport = async (
    userId: number,
    timeframe: DashboardTimeframe,
    since: string,
    until: string
  ): Promise<Report | undefined> => {
    let input = `${prompts.OVERVIEW_PROMPT} \n\n`;
    const sinceDate = parse(since, "yyyyMMdd", Date.now());
    const untilDate = parse(until, "yyyyMMdd", Date.now());

    const data = await reporter.getOverviewData(userId);

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
      createdAt: untilDate,
      data: response,
      ownerId: userId,
      timeframe: timeframe,
      since: sinceDate,
      until: untilDate,
    } satisfies NewReport;

    logger.debug("Generative Reporter: inserting result");
    const insertData = await reportDao.create(newReport);

    logger.debug("Generative Reporter: subtracting user credits");
    const credits = (await userDao.getById(userId))?.credits;
    await userDao.update(userId, {
      credits: credits ? credits - 1 : 0,
    });

    return {
      reportId: insertData[0].insertId,
      ...newReport,
    };
  };
}

export const generativeReporter = new GenerativeReporter(gemini, metaInsights);
