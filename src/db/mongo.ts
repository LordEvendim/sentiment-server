import { MongoClient, Db } from "mongodb";

interface MongoConnectionOptions {
  dbName: string;
  url: string;
  port: string;
}

class MongoConnectionManager {
  private client: MongoClient;
  private dbName: string;
  public connection: Db | undefined;

  constructor({
    dbName = "main",
    url = "localhost",
    port = "27017",
  }: MongoConnectionOptions) {
    this.dbName = dbName;
    this.client = new MongoClient(`mongodb://${url}:${port}`);
  }

  connect = async () => {
    console.log("creating connection with mongo");

    if (!this.client) throw new Error("client is not initialized");

    await this.client.connect();
    this.connection = this.client.db(this.dbName);
    console.log("Connected to MongoDB");
  };
}

export const mongoConnection = new MongoConnectionManager({
  dbName: "main",
  port: "27017",
  url: "localhost",
});

mongoConnection
  .connect()
  .catch(() => console.log("Failed to initialize MongoDB connection"));
