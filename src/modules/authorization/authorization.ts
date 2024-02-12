import { Authorization } from "./types";

class AuthorizationModule implements Authorization {
  async isAdmin(adminKey: string) {
    return adminKey === process.env.ADMIN_KEY;
  }
}

export const authorization = new AuthorizationModule();
