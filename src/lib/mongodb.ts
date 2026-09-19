import { MongoClient, type Collection, type Db, type ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB ?? "pear";
const client = new MongoClient(uri);
const clientPromise = client.connect();

export default clientPromise;

export type Address = {
  flatNo: string;
  landmark: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

export async function getDb(): Promise<Db> {
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}

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
  address?: Address;
  suspended?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function usersCollection(): Promise<Collection<UserDocument>> {
  const collection = getDb().then((db) => db.collection<UserDocument>("users"));
  const resolved = await collection;
  await resolved.createIndex({ email: 1 }, { unique: true });
  await resolved.createIndex({ role: 1, suspended: 1 });
  return resolved;
}

export type OrderDocument = {
  _id?: ObjectId;
  shopperId: string;
  items: { productId: string; name: string; brand: string; quantity: number; size?: string | null; unitPrice: number; total: number; sellerId?: string }[];
  total: number;
  address: Record<string, string>;
  payment: { status: string; provider: string; reference: string };
  status: "placed" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
};

export async function ordersCollection(): Promise<Collection<OrderDocument>> {
  const collection = (await getDb()).collection<OrderDocument>("orders");
  await collection.createIndex({ shopperId: 1, createdAt: -1 });
  await collection.createIndex({ "items.sellerId": 1, createdAt: -1 });
  return collection;
}

export async function databaseHealth() {
  const db = await getDb();
  await db.command({ ping: 1 });
  return { database: db.databaseName, connected: true };
}
