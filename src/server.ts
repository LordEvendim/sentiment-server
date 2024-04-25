import express, { Application } from "express";
import session from "express-session";
import { readFileSync } from "fs";
import helmet from "helmet";
import https from "https";

import cors from "#config/cors";
import { sessionConfig } from "#config/session";
import { endpointLogging } from "#middleware/endpointLogging";
import { queueConsumer, queueProducer } from "#modules/message-broker";
import { scheduler } from "#modules/scheduler/scheduler";
import { authRouter } from "#routes/authRouter";
import { experimentingRouter } from "#routes/experimentingRouter";
import { googleRouter } from "#routes/googleRouter";
import { metaRouter } from "#routes/metaRouter";
import { reporterRouter } from "#routes/reporterRouter";
import { userRouter } from "#routes/userRouter";

const app: Application = express();

export const createServer = () => {
  app.set("trust proxy", 1);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors);

  app.use(session(sessionConfig));
  app.use(helmet());

  app.use(endpointLogging);

  queueProducer.start();
  queueConsumer.start();
  scheduler.start();

  app.use("/exp", experimentingRouter);
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/meta", metaRouter);
  app.use("/reporter", reporterRouter);
  app.use("/google", googleRouter);

  return https.createServer(
    process.env.NODE_ENV === "dev"
      ? { key: readFileSync("./key.pem"), cert: readFileSync("./cert.pem") }
      : {},
    app
  );
};
