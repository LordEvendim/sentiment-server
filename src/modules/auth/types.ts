import { UserInfo } from "api";

export interface AuthProvider {
  login: (username: string, password: string) => Promise<UserInfo | undefined>;
  register: (
    username: string,
    name: string,
    password: string
  ) => Promise<string>;
}
