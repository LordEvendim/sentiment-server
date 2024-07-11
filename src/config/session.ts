import RedisStore from "connect-redis";
import { randomUUID } from "crypto";
import { SessionOptions } from "express-session";
import { redisConnection } from "src/db/redis";

const redisStore = new RedisStore({
  client: redisConnection.connection,
  prefix: "session:",
});

export const sessionConfig = {
  store: redisStore,
  secret: process.env.SESSION_SECRET ?? "secret",
  resave: false,
  saveUninitialized: false,
  name: "sessionId",
  proxy: true,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 365 * 7,
    domain: process.env.COOKIE_DOMAIN ?? "localhost",
  },
  genid: (req) => `${req.body?.username}-${randomUUID()}`,
} satisfies SessionOptions;
