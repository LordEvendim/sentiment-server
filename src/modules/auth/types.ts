import { UserSession } from "#types/user";

export interface AuthProvider {
  login: (
    username: string,
    password: string
  ) => Promise<UserSession | undefined>;
  register: (
    username: string,
    name: string,
    password: string,
    email: string
  ) => Promise<string>;
}
