import { MongoClient, Db } from 'mongodb';
import { env } from '../../config/env.js';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (db) return db;
  if (!client) {
    client = new MongoClient(env.mongoUri);
    await client.connect();
  }
  db = client.db(env.mongoDb);
  return db;
}
