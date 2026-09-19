import { MongoClient } from "mongodb";
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

export async function usersCollection() {
  const client = await clientPromise;
  const collection = client.db(process.env.MONGODB_DB ?? "pear").collection("users");
  await collection.createIndex({ email: 1 }, { unique: true });
  return collection;
}
