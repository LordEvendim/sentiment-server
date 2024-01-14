import { UserInfo } from "#types/user";

export interface AuthProvider {
  login: (username: string, password: string) => Promise<UserInfo | undefined>;
  register: (
    username: string,
    name: string,
    password: string
  ) => Promise<string>;
}
