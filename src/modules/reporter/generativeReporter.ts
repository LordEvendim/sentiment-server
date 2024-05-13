import {
  addWeeks,
  eachDayOfInterval,
  format,
  isWithinInterval,
  subWeeks,
} from "date-fns";

import { reportDao } from "#dao/reportDao";
import { gemini } from "#modules/gemini";
import { GenerativeAi } from "#modules/gemini/types";
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

  generateWeeklyReport = async (userId: number) => {
    let input = "Give recommendations and insights \n\n";

    const data = await reporter.getLast4WeeksOverviewReportData(userId);

    console.log(data);

    const usedSources = new Set<ReportMetricSource>();
    for (let i = 0; i < data.length; i++) {
      usedSources.add(data[i].source);
    }

    const days = eachDayOfInterval({
      end: Date.now(),
      start: subWeeks(Date.now(), 4),
    });

    for (const day of days)
      data.push({
        createdAt: day,
        metricId: "spend",
        source: "meta-ads",
        value: (Math.random() + 1) * 10,
      });

    usedSources.add("google-ads");
    usedSources.add("google-analytics");
    usedSources.add("meta-ads");
    usedSources.add("meta-insights");

    const firstWeek = subWeeks(Date.now(), 4);

    for (const source of usedSources.values()) {
      input += `////// ${source
        .split("-")
        .map((s) => s[0].toUpperCase() + s.slice(1))
        .join(" ")} \n`;

      let currentWeek = firstWeek;

      for (let i = 0; i < 4; i++) {
        input += `Week ${i + 1}\n`;

        // display data and metrics
        input += [...data]
          .filter((datapoint) => datapoint.source === source)
          .filter((d) =>
            isWithinInterval(d.createdAt, {
              start: currentWeek,
              end: addWeeks(currentWeek, 1),
            })
          )
          .sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf())
          .map(
            (d) =>
              `${format(d.createdAt, "yyyy-MM-dd")} - ${
                d.metricId
              } - ${d.value.toFixed(3)}`
          )
          .join("\n");

        input += "\n\n";
        currentWeek = addWeeks(currentWeek, 1);
      }

      input += "\n";
    }

    console.log(input);
    return input;
  };
}

export const generativeReporter = new GenerativeReporter(gemini, metaInsights);
