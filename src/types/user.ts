export enum Roles {
  Admin = "admin",
  User = "user",
}

export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: Roles;
}

export type UserInfo = Omit<User, "password">;

export type UserProfile = Pick<User, "id" | "username">;
