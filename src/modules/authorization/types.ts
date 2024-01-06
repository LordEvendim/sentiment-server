export interface Authorization {
  isAdmin: (userId: string) => Promise<boolean>;
}
