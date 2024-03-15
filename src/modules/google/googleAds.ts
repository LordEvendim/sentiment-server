export class GoogleAds {
  baseUrl = "https://googleads.googleapis.com/v16";

  constructor() {}

  getUserAccounts = async (userId: number) => {};

  connectUserAccounts = async (userId: number) => {};

  selectAccount = async (userId: number, pageId: number) => {};
}

export const googleAds = new GoogleAds();
