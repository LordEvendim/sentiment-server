import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import { logger } from "#modules/logger";

import * as schema from "./schema";

export const devConfig = {
  host: process.env.MYSQL_DEV_HOST ?? "localhost",
  port: process.env.MYSQL_DEV_PORT
    ? parseInt(process.env.MYSQL_DEV_PORT)
    : 3306,
  database: process.env.MYSQL_DEV_DATABASE ?? "mydb",
  user: process.env.MYSQL_DEV_USER ?? "root",
  password: process.env.MYSQL_DEV_PASSWORD ?? "example",
} satisfies mysql.ConnectionOptions;

const prodConfig = {
  uri: process.env.MYSQL_URL,
} satisfies mysql.ConnectionOptions;

const connection = mysql.createPool(
  process.env.NODE_ENV === "prod" ? prodConfig : devConfig
);

logger.info("MySQL: connected");

export const mysqlDatabase = drizzle(connection, { schema, mode: "default" });
