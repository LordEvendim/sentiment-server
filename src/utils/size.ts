type Megabytes = string;

export const getStorageSize = (data: Array<unknown> | object): Megabytes => {
  return (new Blob([JSON.stringify(data)]).size / 1000000).toString();
};
