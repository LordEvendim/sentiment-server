import { NextFunction, Request, Response } from "express";

export const isAuthenticated = (
  req: Request,
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
