import { logger } from "#modules/logger/logger";
import { Response } from "express";
import { ZodError } from "zod";

export const handleControllerError = (
  res: Response,
  error: Error | unknown
) => {
  logger.error(error);

  if (error instanceof Error) {
    logger.error(error.message);
    return res.status(500).send({ message: error.message });
  } else if (error instanceof ZodError) {
    logger.error(error.message);
    return res.status(500).send({ message: "Validation error" });
  }

  return res.status(500).send({ message: "Server error" });
};

export const handleError = (error: unknown, message: string) => {
  // TODO: handle with winston
  console.log(error);

  if (error instanceof Error && error.message) {
    return new Error(error.message);
  }

  return new Error(message);
};
