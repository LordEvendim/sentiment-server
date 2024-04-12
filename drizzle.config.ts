import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema/*",
  out: "./drizzle",
  driver: "mysql2",
  dbCredentials:
    process.env.NODE_ENV === "prod"
      ? {
          host: process.env.MYSQL_HOST!,
          user: process.env.MYSQL_USERNAME!,
          password: process.env.MYSQL_PASSWORD!,
          database: process.env.MYSQL_DB!,
        }
      : {
          host: "localhost",
          user: "root",
          password: "example",
          database: "mydb",
        },
} satisfies Config;
