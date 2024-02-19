import { Response } from "express";
import { ZodError } from "zod";

import { logger } from "#modules/logger/logger";

export const handleControllerError = (res: Response, error: unknown) => {
  if (error instanceof Error || error instanceof ZodError) {
    logger.error(error.message);
    logger.error(error);
    return res.status(500).send(error.message);
  }

  logger.error("Server error");
  logger.error(error);
  return res.status(500).send("Server error");
};

export const handleError = (error: unknown, message: string) => {
  // TODO: handle with winston
  console.log(error);

  if (error instanceof Error && error.message) {
    return new Error(error.message);
  }

  return new Error(message);
};
