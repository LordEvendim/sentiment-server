import { NextFunction, Response } from "express";

import { TypedRequest } from "#types/express";

export const isAuthenticated = (
  req: TypedRequest<unknown, unknown, unknown>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.session.user) return next();

    return res.status(500).send("Unauthenticated");
  } catch (error: unknown) {
    return error instanceof Error
      ? res.status(500).send(error.message)
      : res.status(500).send("Authorization error");
  }
};
