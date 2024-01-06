import { Interval } from "api";

import { SupportedRPCNetworks } from "#config/chains";
import { PriceTick } from "./price";

export interface PriceFeed {
  getHistoricalPrices: (
    id: string,
    interval: Interval,
    options?: {
      limit?: number;
    }
  ) => Promise<PriceTick[]>;
}

export interface RpcNode {
  RPC_URLS: Partial<Record<SupportedRPCNetworks, string>>;
}
