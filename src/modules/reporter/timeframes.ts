import { addDays, startOfDay, subDays, subMonths, subYears } from "date-fns";

export type DashboardTimeframe =
  | "last-7-days"
  | "last-14-days"
  | "last-30-days"
  | "last-90-days"
  | "last-6-months"
  | "last-year";

export const DashboardTimeframes: Record<string, DashboardTimeframe> = {
  LAST_7_DAYS: "last-7-days",
  LAST_14_DAYS: "last-14-days",
  LAST_30_DAYS: "last-30-days",
  LAST_90_DAYS: "last-90-days",
  LAST_6_MONTHS: "last-6-months",
  LAST_YEAR: "last-year",
};

const timeframeStartFunctions: Record<DashboardTimeframe, (end: Date) => Date> =
  {
    "last-7-days": (end) => subDays(end, 7),
    "last-14-days": (end) => subDays(end, 14),
    "last-30-days": (end) => subDays(end, 30),
    "last-90-days": (end) => subDays(end, 90),
    "last-6-months": (end) => subMonths(end, 6),
    "last-year": (end) => subYears(end, 1),
  };

export const calculateTimeframeStart = (
  now: Date,
  timeframe: DashboardTimeframe
) =>
  startOfDay(addDays(timeframeStartFunctions[timeframe](subDays(now, 1)), 1));
