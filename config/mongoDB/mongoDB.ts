import { MongoClient } from "mongodb";

export function mongodb() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME;
  if (!uri) {
    throw new Error("MONGO_URI is not defined");
  }
  
  if (!dbName) {
    throw new Error("MONGO_DB_NAME is not defined");
  }

  const client = new MongoClient(uri);

  const db = client.db(dbName);
  return db;
}

