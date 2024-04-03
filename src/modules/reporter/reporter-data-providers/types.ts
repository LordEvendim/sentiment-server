import { GeneralDashboardReportData } from "../types";

export interface ReporterDataProvider {
  generalReport(
    userId: number,
    report: GeneralDashboardReportData
  ): Promise<void>;
}
