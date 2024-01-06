import RedisStore from "connect-redis";
import { SessionOptions } from "express-session";

import { redisConnection } from "src/db/redis";

const redisStore = new RedisStore({
  client: redisConnection.connection,
  prefix: "session:",
});

export const sessionConfig = {
  store: redisStore,
  secret: "secret",
  resave: false,
  saveUninitialized: false,
  name: "sessionId",
  proxy: process.env.SERVER_ENV === "prod",
  cookie: {
    httpOnly: true,
    secure: process.env.SERVER_ENV === "prod",
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 365 * 7,
    domain:
      process.env.SERVER_ENV === "prod" ? "atlantica.finance" : "localhost",
  },
} satisfies SessionOptions;
