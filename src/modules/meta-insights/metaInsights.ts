import axios from "axios";
import { BreakdownOptions, SupportedBreakdownFields } from "./types";

class MetaInsights {
  apiVersion = "v18.0";
  baseUrl = "https://graph.facebook.com/";
  accessToken = "";

  constructor() {
    this.accessToken = process.env.META_ACCESS_TOKEN ?? "";
  }

  getAdAccount = async (adCampaignId: string) => {
    const result = await axios.get(
      `${this.baseUrl}/${this.apiVersion}/${adCampaignId}/insights`,
      {
        params: {},
      }
    );

    return result;
  };

  getCampaignStatistics = async (
    adCampaignId: string,
    breakdowns: BreakdownOptions[],
    fields: SupportedBreakdownFields[]
  ) => {
    const result = await axios.get(
      `${this.baseUrl}/${this.apiVersion}/${adCampaignId}/insights`,
      {
        data: {
          breakdowns: breakdowns.join(","),
          fields: fields.join(","),
          access_token: this.accessToken,
        },
      }
    );

    return result;
  };
}

export const metaInsights = new MetaInsights();

// curl -G \
//   -d "breakdowns=age,gender" \
//   -d "fields=impressions" \
//   -d "access_token=<ACCESS_TOKEN>" \
//   "https://graph.facebook.com/<API_VERSION>/<AD_CAMPAIGN_ID>/insights"
