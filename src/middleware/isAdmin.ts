import { NextFunction, Request, Response } from "express";

import { authorization } from "#modules/authorization";

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.session.user) return res.status(500).send("Unauthenticated");

    const isAdmin = await authorization.isAdmin(req.session.user.id);

    return isAdmin ? next() : res.status(500).send("Unauthenticated");
  } catch (error: unknown) {
    return error instanceof Error
      ? res.status(500).send(error.message)
      : res.status(500).send("Authorization error");
  }
};
