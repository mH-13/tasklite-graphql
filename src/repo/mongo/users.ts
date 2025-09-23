import { ObjectId } from 'mongodb';
import { getDb } from './client.js';

const COLL = 'users';

export type UserDoc = {
  _id: ObjectId;
  email: string;
  name?: string;
};

export class UsersRepo {
  async ensureUser(id: string): Promise<UserDoc> {
    const db = await getDb();
    const _id = new ObjectId(id);
    const existing = await db.collection<UserDoc>(COLL).findOne({ _id });
    if (existing) return existing;
    const doc: UserDoc = { _id, email: `${id}@dev.local`, name: 'Dev User' };
    await db.collection<UserDoc>(COLL).insertOne(doc);
    await db.collection<UserDoc>(COLL).createIndex({ email: 1 }, { unique: true });
    return doc;
  }

  async getById(id: string): Promise<UserDoc | null> {
    const db = await getDb();
    return db.collection<UserDoc>(COLL).findOne({ _id: new ObjectId(id) });
  }
}
