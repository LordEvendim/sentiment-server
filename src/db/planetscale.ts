import { Config, connect } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

const devConfig = {
  host: process.env.PLANETSCALE_HOST,
  username: process.env.PLANETSCALE_DEV_USERNAME,
  password: process.env.PLANETSCALE_DEV_PASSWORD,
} satisfies Config;

const prodConfig = {
  host: process.env.PLANETSCALE_HOST,
  username: process.env.PLANETSCALE_USERNAME,
  password: process.env.PLANETSCALE_PASSWORD,
} satisfies Config;

const connection = connect(
  process.env.NODE_ENV === "prod" ? prodConfig : devConfig
);

export const planetScaleDB = drizzle(connection);
