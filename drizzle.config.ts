import type { Config } from "drizzle-kit";
import { devConfig } from "./src/db/mysql";

type DBCredentials =
  | {
      host: string;
      port?: number | undefined;
      user?: string | undefined;
      password?: string | undefined;
      database: string;
    }
  | {
      uri: string;
    };

export default {
  schema: "./src/db/schema/*",
  out: "./drizzle",
  driver: "mysql2",
  dbCredentials: {
    dev: devConfig,
    prod: {
      uri: process.env.MYSQL_URL!,
    },
    staging: {
      uri: process.env.MYSQL_STAGING_URL ?? process.env.MYSQL_URL!,
    },
  }[process.env.NODE_ENV!] as DBCredentials,
} satisfies Config;
