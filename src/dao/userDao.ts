import { Filter } from "mongodb";

import { User } from "api";

import { MongoCollections } from "src/db/collections";
import { mongoConnection } from "src/db/mongo";

const createUserDao = () => {
  return {
    findOne: async (query: Filter<User>) => {
      if (!mongoConnection.connection)
        throw new Error("Mongo database is not connected");

      const collection = mongoConnection.connection.collection<User>(
        MongoCollections.USER
      );

      const user = await collection.findOne(query);

      return user;
    },
    findMany: async (query: Filter<User>) => {
      if (!mongoConnection.connection)
        throw new Error("Mongo database is not connected");

      const collection = mongoConnection.connection.collection<User>(
        MongoCollections.USER
      );

      const user = await collection.find(query).toArray();

      return user;
    },
    create: async (newData: User) => {
      if (!mongoConnection.connection)
        throw new Error("Mongo database is not connected");

      const collection = mongoConnection.connection.collection<User>(
        MongoCollections.USER
      );

      const result = await collection.insertOne(newData);

      return result.insertedId;
    },
    update: async (query: Filter<User>, newData: Partial<User>) => {
      if (!mongoConnection.connection)
        throw new Error("Mongo database is not connected");

      const collection = mongoConnection.connection.collection<User>(
        MongoCollections.USER
      );

      const result = await collection.updateOne(query, newData);

      return result.upsertedId;
    },
    deleteOne: async (query: Filter<User>) => {
      if (!mongoConnection.connection)
        throw new Error("Mongo database is not connected");

      const collection = mongoConnection.connection.collection<User>(
        MongoCollections.USER
      );

      await collection.deleteOne(query);

      return true;
    },
    deleteMany: async (query: Filter<User>) => {
      if (!mongoConnection.connection)
        throw new Error("Mongo database is not connected");

      const collection = mongoConnection.connection.collection<User>(
        MongoCollections.USER
      );

      await collection.deleteMany(query);

      return true;
    },
  };
};

export const userDao = createUserDao();
export type UserDao = typeof userDao;
