import { UserInfo } from "#types/user";

export interface PostLoginDetails extends Record<string, string> {
  username: string;
  password: string;
}

export type LoginResponse = UserInfo | Record<string, never>;

export interface PostRegister extends Record<string, string> {
  username: string;
  name: string;
  password: string;
}
