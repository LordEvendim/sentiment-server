import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema/*",
  out: "./drizzle",
  driver: "mysql2",
  dbCredentials: {
    uri: (process.env.PLANETSCALE_DEV_URI +
      '?ssl={"rejectUnauthorized":true}&&sslaccept=strict') as string,
  },
} satisfies Config;
