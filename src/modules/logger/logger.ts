import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `[${new Date(timestamp).toLocaleString()}] ${level}: ${message}`;
});

export const logger = createLogger({
  format: combine(timestamp(), format.json()),
  transports: [
    new transports.Console({
      format: combine(timestamp(), format.colorize(), myFormat),
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
      dirname: `logs`,
      filename: "error.log",
      level: "error",
    }),
  ],
});
