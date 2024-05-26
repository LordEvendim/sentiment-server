import { UserSession } from "#types/user";

export interface PostLoginDetails extends Record<string, string> {
  username: string;
  password: string;
}

export type LoginResponse = UserSession | Record<string, never>;
