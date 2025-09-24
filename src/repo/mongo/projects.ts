import { ObjectId } from 'mongodb';
import { getDb } from './client.js';

const COLL = 'projects';

export type ProjectDoc = {
  _id: ObjectId;
  name: string;
  key: string;
  ownerId: ObjectId;
};

export class ProjectsRepo {
  async initIndexes() {
    const db = await getDb();
    await db.collection<ProjectDoc>(COLL).createIndex({ ownerId: 1, key: 1 }, { unique: true });
  }

  async create(name: string, key: string, ownerId: string): Promise<ProjectDoc> {
    await this.initIndexes();
    const db = await getDb();
    const coll = db.collection<ProjectDoc>(COLL);

    // Normalize key to ensure consistent uniqueness (e.g., "mvl" -> "MVL")
    const normKey = key.trim().toUpperCase();
    const owner = new ObjectId(ownerId);

    // Fast path: if already exists for this owner/key, return it
    const existing = await coll.findOne({ ownerId: owner, key: normKey });
    if (existing) return existing;

    const doc: ProjectDoc = { _id: new ObjectId(), name, key: normKey, ownerId: owner };
    try {
      await coll.insertOne(doc);
      return doc;
    } catch (e: any) {
      // In case of race/duplicate, fetch and return the existing doc
      if (e && (e.code === 11000 || e.code === 'E11000')) {
        const dup = await coll.findOne({ ownerId: owner, key: normKey });
        if (dup) return dup;
      }
      throw e;
    }
  }

  async getById(id: string): Promise<ProjectDoc | null> {
    const db = await getDb();
    return db.collection<ProjectDoc>(COLL).findOne({ _id: new ObjectId(id) });
  }
}
