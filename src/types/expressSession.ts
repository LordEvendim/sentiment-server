import { UserInfo } from "api";

declare module "express-session" {
  interface SessionData {
    user: UserInfo;
  }
}
