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
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
} satisfies mysql.ConnectionOptions;

const connection = await mysql.createConnection(
  process.env.NODE_ENV === "prod" ? prodConfig : devConfig
);

logger.info("MySQL: connected");

export const mysqlDatabase = drizzle(connection, { schema, mode: "default" });
