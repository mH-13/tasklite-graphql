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
    const doc: ProjectDoc = { _id: new ObjectId(), name, key, ownerId: new ObjectId(ownerId) };
    await db.collection<ProjectDoc>(COLL).insertOne(doc);
    return doc;
  }

  async getById(id: string): Promise<ProjectDoc | null> {
    const db = await getDb();
    return db.collection<ProjectDoc>(COLL).findOne({ _id: new ObjectId(id) });
  }
}
