import { parse, subYears } from "date-fns";
import { Response } from "express";

import { NewReport, Report } from "#db/schema";
import { NewMetricReport } from "#db/schema/MetricReports";
import { generativeReporter, reporter } from "#modules/reporter";
import { DashboardTimeframe } from "#modules/reporter/timeframes";
import { ReportData, ReportMetricSource } from "#modules/reporter/types";
import { TypedRequest } from "#types/express";
import { handleControllerError } from "#utils/errorHandling";

const createReporterController = () => {
  return {
    getChartData: async (
      req: TypedRequest<
        object,
        object,
        {
          metricId: string;
          source: ReportMetricSource;
          since: string;
        }
      >,
      res: Response<{
        metricId: string;
        source: ReportMetricSource;
        since: string;
        data: [number, number][];
      }>
    ) => {
      try {
        const { user } = req.session;
        const { metricId, source, since } = req.query;

        if (!user) throw new Error("User not authenticated");
        if (!metricId) throw new Error("MetricId not specified");
        if (!source) throw new Error("metric source not specified");
        if (!since) throw new Error("Since not specified");

        const result = await reporter.getChartData(
          user.id,
          metricId,
          source,
          since
        );

        return res.status(200).send({
          data: result,
          metricId: metricId,
          since: since,
          source: source,
        });
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    getMetricReport: async (
      req: TypedRequest<
        object,
        object,
        {
          name: string;
          timeframe: DashboardTimeframe;
          until: string;
        }
      >,
      res: Response<NewMetricReport>
    ) => {
      try {
        const { user } = req.session;
        const { name, timeframe, until } = req.query;

        if (!user) throw new Error("User not authenticated");
        if (!timeframe) throw new Error("Timeframe not specified");
        if (!name) throw new Error("Name not specified");
        if (!until) throw new Error("Since not specified");

        const result = await generativeReporter.getMetricReport(
          user.id,
          name,
          timeframe,
          until
        );

        return res.status(200).send(result);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    generateGeneralReport: async (
      req: TypedRequest<{
        timeframe: DashboardTimeframe;
        since: string;
        until: string;
      }>,
      res: Response<NewReport>
    ) => {
      try {
        const { user } = req.session;
        const { timeframe, since, until } = req.body;

        if (!user) throw new Error("User not authenticated");
        if (!timeframe || !until || !since)
          throw new Error("Timeframe or period bounds not specified");

        const result = await generativeReporter.generateReport(
          user.id,
          timeframe,
          since,
          until
        );

        return res.status(200).send(result);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    getGeneralReport: async (
      req: TypedRequest<object, object, { timeframe: string; until?: string }>,
      res: Response<Report | undefined>
    ) => {
      try {
        const { user } = req.session;
        const timeframe = req.query.timeframe ?? "7";

        if (!user) throw new Error("User not authenticated");

        const report = await generativeReporter.getReport(user.id, timeframe);

        return res.status(200).send(report);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    getGeneralDashboardData: async (
      req: TypedRequest<object, object, { since: string }>,
      res: Response<ReportData | undefined>
    ) => {
      try {
        const { user } = req.session;

        if (!user) throw new Error("User not authenticated");
        if (!req.query.since) throw new Error("Timeframe not specified");

        const since = parse(req.query.since, "yyyyMMdd", Date.now()).getTime();

        if (since < subYears(Date.now(), 2).getTime())
          throw new Error("Timeframe out of range");

        const report = await reporter.getGeneralDashboardData(user.id, since);

        return res.status(200).send(report);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
  };
};

export const reporterController = createReporterController();
