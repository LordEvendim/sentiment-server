import { Response } from "express";
import { ZodError } from "zod";

import { logger } from "#modules/logger/logger";

export const handleControllerError = (res: Response, error: unknown) => {
  logger.error(error);

  if (error instanceof Error || error instanceof ZodError)
    return res.status(500).send(error.message);

  return res.status(500).send("Server error");
};

export const handleError = (error: unknown, message: string) => {
  logger.error(error);
  logger.error(message);

  if (error instanceof Error && error.message) {
    return new Error(error.message);
  }

  return new Error(message);
};
