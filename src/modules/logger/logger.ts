import { createLogger, format, transports } from "winston";

import { DiscordTransport } from "./discordTransport";

const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp, stack }) => {
  return `[${new Date(timestamp).toLocaleString()}] ${level}: ${message} ${
    stack && `\n${JSON.stringify(stack, null, 3)}`
  }`;
});

export const logger = createLogger({
  // format: combine(timestamp(), format.json()),
  transports: [
    new transports.Console({
      format: format.combine(
        format.errors({ stack: true }),
        format.timestamp(),
        format.printf((info) => {
          let message = `[${new Date(info.timestamp).toLocaleString()}] ${
            info.level
          }: ${
            typeof info.message === "object"
              ? JSON.stringify(info.message, null, 3)
              : info.message
          }`;

          if (info.stack) {
            message += "\n" + info.stack;
          }

          return message;
        }),
        format.colorize({ all: true })
      ),
      level: "debug",
    }),
    new transports.File({
      dirname: `logs`,
      filename: "debug.log",
      level: "debug",
    }),
    new transports.File({
      format: combine(timestamp(), myFormat),
      dirname: `logs`,
      filename: "debug.pretty.log",
      level: "debug",
    }),
    new transports.File({
      format: combine(
        format.errors({ stack: true }),
        timestamp(),
        format.simple()
      ),
      dirname: `logs`,
      filename: "error.log",
      level: "error",
    }),
  ],
});

process.env.NODE_ENV !== "dev" &&
  logger.add(
    new DiscordTransport({
      level: "error",
    })
  );
