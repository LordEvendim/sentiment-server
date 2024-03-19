export type GoogleAnalyticsMetricsNames =
  | "activeUsers"
  | "bounceRate"
  | "newUsers"
  | "sessions"
  | "engagementRate"
  | "conversions"
  | "cartToViewRate"
  | "userConversionRate"
  | "advertiserAdCostPerConversion"
  | "sessionsPerUser"
  | "addToCarts"
  | "checkouts"
  | "ecommercePurchases";

export const googleAnalyticsMetricsDetails: Record<
  GoogleAnalyticsMetricsNames,
  {
    displayName: string;
    description: string;
  }
> = {
  activeUsers: {
    displayName: "Active users",
    description: "The number of distinct users who visited your site or app.",
  },
  bounceRate: {
    displayName: "Bounce rate",
    description:
      "The percentage of sessions that were not engaged ((Sessions Minus Engaged sessions) divided by Sessions). This metric is returned as a fraction; for example, 0.2761 means 27.61% of sessions were bounces.",
  },
  newUsers: {
    displayName: "New users",
    description:
      "The number of users who interacted with your site or launched your app for the first time (event triggered: first_open or first_visit).",
  },
  sessions: {
    displayName: "Sessions",
    description:
      "The number of sessions that began on your site or app (event triggered: session_start).",
  },
  engagementRate: {
    displayName: "Engagement rate",
    description:
      "The percentage of engaged sessions (Engaged sessions divided by Sessions). This metric is returned as a fraction; for example, 0.7239 means 72.39% of sessions were engaged sessions.",
  },
  conversions: {
    displayName: "Conversions",
    description:
      "The count of conversion events. Events are marked as conversions at collection time; changes to an event's conversion marking apply going forward. ",
  },
  cartToViewRate: {
    displayName: "Cart-to-view rate",
    description:
      "The number of users who added a product(s) to their cart divided by the number of users who viewed the same product(s). This metric is returned as a fraction",
  },
  userConversionRate: {
    displayName: "User conversion rate",
    description: "The percentage of users who triggered any conversion event.",
  },
  advertiserAdCostPerConversion: {
    displayName: "Cost per conversion",
    description: "Cost per conversion is ad cost divided by conversions.",
  },
  sessionsPerUser: {
    displayName: "Sessions per user",
    description: "The average number of sessions per user ",
  },
  addToCarts: {
    displayName: "Add to carts",
    description:
      "The number of times users added items to their shopping carts.",
  },
  checkouts: {
    displayName: "Checkouts",
    description: "The number of times users started the checkout process. ",
  },
  ecommercePurchases: {
    displayName: "Ecommerce purchases",
    description: "The number of times users completed a purchase. ",
  },
};

export const googleAnalyticsMetricsNames = Object.keys(
  googleAnalyticsMetricsDetails
) as GoogleAnalyticsMetricsNames[];
