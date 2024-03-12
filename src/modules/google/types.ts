export interface GoogleAccount {
  name: string;
  createTime: string;
  updateTime: string;
  displayName: string;
  regionCode: string;
}

export interface GoogleProperty {
  name: string;
  parent: string;
  createTime: string;
  updateTime: string;
  displayName: string;
  timeZone: string;
  currencyCode: string;
  serviceLevel: string;
  account: string;
  propertyType: string;
}
