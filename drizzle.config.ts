import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema/*",
  out: "./drizzle",
  driver: "mysql2",
  dbCredentials:
    process.env.NODE_ENV === "prod"
      ? {
          uri: process.env.MYSQL_URL!,
        }
      : {
          host: "localhost",
          user: "root",
          password: "example",
          database: "mydb",
        },
} satisfies Config;
