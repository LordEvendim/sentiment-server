import { UserSession } from "./user";

declare module "express-session" {
  interface SessionData {
    user: UserSession;
  }
}
