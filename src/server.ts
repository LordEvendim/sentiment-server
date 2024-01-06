import express, { Application } from "express";
import session from "express-session";

import cors from "#config/cors";
import { sessionConfig } from "#config/session";
import { experimentingRouter } from "#routes/experimentingRouter";
import { authRouter } from "#routes/authRouter";
import { userRouter } from "#routes/userRouter";

const app: Application = express();

export const server = () => {
  app.set("trust proxy", 1);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors);

  app.use(session(sessionConfig));

  app.use("/exp", experimentingRouter);
  app.use("/auth", authRouter);
  app.use("/user", userRouter);

  return app;
};
