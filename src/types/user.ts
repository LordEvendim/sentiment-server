import { User } from "#db/schema/users";

export type UserInfo = Omit<User, "password">;

export type UserProfile = Pick<User, "id" | "username">;
