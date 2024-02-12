import { connect } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

const connection = connect({
  host: process.env["PLANETSCALE_HOST"],
  username: process.env["PLANETSCALE_USERNAME"],
  password: process.env["PLANETSCALE_PASSWORD"],
});

export const planetScaleDB = drizzle(connection);
