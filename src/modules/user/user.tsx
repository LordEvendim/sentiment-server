import { render } from "@react-email/render";
import { compare, hash } from "bcrypt";
import { randomBytes } from "crypto";
import React from "react";
import PasswordReset from "src/emails/PasswordReset";

import { SALTING_ROUNDS } from "#config/crypto";
import { passwordResetTokenDao } from "#dao/passwordResetTokenDao";
import { sessionTokenDao } from "#dao/sessionTokenDao";
import { userDao } from "#dao/userDao";
import { mailJet } from "#modules/mail-jet/mailjet";

const PASSWORD_RESET_SALTING_ROUNDS = 12;

export class UserModule {
  constructor() {}

  resetPassword = async (email: string) => {
    const user = await userDao.getByEmail(email);
    if (!user) throw new Error("User doesn't exist");

    const currentToken = await passwordResetTokenDao.getTokenByUserId(user.id);
    if (currentToken) throw new Error("Wait before reseting again");

    const resetToken = randomBytes(32).toString("hex");
    const tokenHash = await hash(resetToken, PASSWORD_RESET_SALTING_ROUNDS);

    await passwordResetTokenDao.createToken(user.id, tokenHash);

    const url = `${
      process.env.NODE_ENV === "dev"
        ? "https://localhost:5173"
        : `https://${process.env.DOMAIN}`
    }/password-reset?token=${resetToken}&userId=${user.id}`;

    const renderedEmail = render(<PasswordReset link={url} />);

    await mailJet.send(
      "support",
      { email: email, name: user.fullName },
      "Click Clarity AI password reset",
      "",
      renderedEmail
    );
  };

  setPassword = async (userId: number, token: string, password: string) => {
    const tokenHash = await passwordResetTokenDao.getTokenByUserId(userId);

    if (!tokenHash) return;

    const isValid = compare(token, tokenHash);

    if (!isValid) return;

    const hashedPassword = await hash(password, SALTING_ROUNDS);

    const user = await userDao.getById(userId);

    if (!user) return;

    await userDao.update(userId, {
      password: hashedPassword,
    });

    await sessionTokenDao.deleteSessionsByUsername(user.username);
  };

  updateSession = async (userId: number) => {
    const user = await userDao.getById(userId);

    if (!user) throw new Error("User doesn't exist");

    await sessionTokenDao.updateSessionsByUsername(user);
  };
}

export const userModule = new UserModule();
