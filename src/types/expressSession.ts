import { User } from "#db/schema/users";

declare module "express-session" {
  interface SessionData {
    user: Omit<User, "password">;
  }
}
