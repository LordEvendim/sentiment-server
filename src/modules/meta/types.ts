export type BreakdownOptions =
  | "action_device"
  | "action_canvas_component_name"
  | "action_carousel_card_id"
  | "action_carousel_card_name"
  | "action_destination"
  | "action_reaction"
  | "action_target_id"
  | "action_type"
  | "action_video_sound"
  | "action_video_type"
  | "ad_format_asset"
  | "age"
  | "app_id"
  | "body_asset"
  | "call_to_action_asset"
  | "country"
  | "description_asset"
  | "device_platform"
  | "dma"
  | "frequency_value"
  | "gender"
  | "hourly_stats_aggregated_by_advertiser_time_zone"
  | "hourly_stats_aggregated_by_audience_time_zone"
  | "image_asset"
  | "impression_device"
  | "is_conversion_id_modeled"
  | "link_url_asset"
  | "place_page_id"
  | "platform_position"
  | "product_id"
  | "publisher_platform"
  | "region"
  | "skan_campaign_id"
  | "skan_conversion_id"
  | "title_asset"
  | "user_segment_key"
  | "video_asset";

export type SupportedBreakdownFields =
  | "impressions"
  | "clicks"
  | "spend"
  | "reach"
  | "actions"
  | "action_values";

export type MetricPeriod = "day" | "week" | "days_28" | "lifetime";

export type GetUserPages = {
  data: Array<{
    access_token: string;
    category: string;
    category_list: [
      {
        id: string;
        name: string;
      },
    ];
    name: string;
    id: string;
    tasks: string[];
  }>;
  paging: {
    cursors: {
      before: string;
      after: string;
    };
  };
};

export type GetLongLivedToken = {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
};

export type PageInsights = {
  data: (
    | {
        name: string;
        period: Exclude<MetricPeriod, "lifetime">;
        values: {
          value: number | Record<string, number>;
          end_time: string;
        }[];
        title: string;
        description: string;
        id: string;
      }
    | {
        name: string;
        period: "lifetime";
        values: {
          value: number | Record<string, number>;
        }[];
        title: string;
        description: string;
        id: string;
      }
  )[];
};
