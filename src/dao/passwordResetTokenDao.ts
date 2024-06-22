import { redisConnection } from "#db/redis";

const PASSWORD_RESET_TOKEN_KEY_PREFIX = "password-reset";
const TOKEN_EXPIRATION = 60 * 10; // 10 minutes

export const passwordResetTokenDao = {
  createToken: async (userId: number, tokenHash: string) => {
    await redisConnection.connection.set(
      [PASSWORD_RESET_TOKEN_KEY_PREFIX, userId].join(":"),
      tokenHash,
      "EX",
      TOKEN_EXPIRATION
    );
  },
  getTokenByUserId: async (userId: number) => {
    const result = await redisConnection.connection.get(
      [PASSWORD_RESET_TOKEN_KEY_PREFIX, userId].join(":")
    );

    return result;
  },
};

export type PasswordResetDao = typeof passwordResetTokenDao;
