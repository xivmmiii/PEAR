import { MongoClient } from "mongodb";
import type { Collection, ObjectId } from "mongodb";
const uri = process.env.MONGODB_URI;
const options = {};
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  client = new MongoClient("mongodb://127.0.0.1:27017");
  clientPromise = Promise.resolve(client);
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export type UserDocument = {
  _id?: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash?: string;
  role: "shopper" | "seller" | "admin";
  wishlist?: string[];
  bag?: { productId: string; quantity: number; size: string | null }[];
  brandName?: string;
  phone?: string;
  address?: Record<string, string>;
  suspended?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function usersCollection(): Promise<Collection<UserDocument>> {
  const client = await clientPromise;
  const collection = client.db(process.env.MONGODB_DB ?? "pear").collection<UserDocument>("users");
  await collection.createIndex({ email: 1 }, { unique: true });
  return collection;
}
