import type { Config } from "drizzle-kit";
import { devConfig } from "./src/db/mysql";

export default {
  schema: "./src/db/schema/*",
  out: "./drizzle",
  driver: "mysql2",
  dbCredentials:
    process.env.NODE_ENV === "prod"
      ? {
          uri: process.env.MYSQL_URL!,
        }
      : devConfig,
} satisfies Config;
