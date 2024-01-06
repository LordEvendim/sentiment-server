import { createLogger, format, transports } from "winston";

const { combine, timestamp, label, prettyPrint } = format;

export const logger = createLogger({
  format: combine(label({ label: "SERVER" }), timestamp(), prettyPrint()),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    new transports.File({
      filename: "error.log",
      level: "error",
      format: format.simple(),
    }),
  ],
});
