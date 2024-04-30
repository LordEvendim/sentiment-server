import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import { logger } from "#modules/logger";

import * as schema from "./schema";

const devConfig = {
  host: "localhost",
  port: 3306,
  database: "mydb",
  user: "root",
  password: "example",
} satisfies mysql.ConnectionOptions;

const prodConfig = {
  uri: process.env.MYSQL_URL,
} satisfies mysql.ConnectionOptions;

const connection = mysql.createPool(
  process.env.NODE_ENV === "prod" ? prodConfig : devConfig
);

logger.info("MySQL: connected");

export const mysqlDatabase = drizzle(connection, { schema, mode: "default" });
