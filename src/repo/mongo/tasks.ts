import { ObjectId, Document } from 'mongodb';
import { getDb } from './client.js';
import { TaskStatus } from '../../graphql/types/enums.js';
import { encodeCursor, decodeCursor } from '../../utils/pagination.js';

const COLL = 'tasks';

export type TaskDoc = {
  _id: ObjectId;
  projectId: ObjectId;
  title: string;
  status: TaskStatus;
  assigneeId?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export class TasksRepo {
  async initIndexes() {
    const db = await getDb();
    await db.collection<TaskDoc>(COLL).createIndex({ projectId: 1, createdAt: -1 });
    await db.collection<TaskDoc>(COLL).createIndex({ projectId: 1, status: 1, createdAt: -1 });
    await db.collection<TaskDoc>(COLL).createIndex({ assigneeId: 1, createdAt: -1 });
  }

  private toApi(t: TaskDoc) {
    return {
      id: t._id.toHexString(),
      projectId: t.projectId.toHexString(),
      title: t.title,
      status: t.status,
      assigneeId: t.assigneeId?.toHexString(),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString()
    };
  }

  async upsert(input: {
    id?: string;
    projectId: string;
    title: string;
    status?: TaskStatus;
    assigneeId?: string;
  }) {
    await this.initIndexes();
    const db = await getDb();
    const now = new Date();

    // Fields we always set on write
    const setDoc: Partial<TaskDoc> = {
      projectId: new ObjectId(input.projectId),
      title: input.title,
      status: input.status ?? TaskStatus.TODO,
      assigneeId: input.assigneeId ? new ObjectId(input.assigneeId) : undefined,
      updatedAt: now
    };

    if (input.id) {
      // Overwrite/update existing by id; if missing, insert
      const _id = new ObjectId(input.id);
      await db.collection<TaskDoc>(COLL).updateOne(
        { _id },
        { $set: setDoc, $setOnInsert: { createdAt: now } },
        { upsert: true }
      );
      const doc = await db.collection<TaskDoc>(COLL).findOne({ _id });
      if (!doc) throw new Error('Task not found after upsert');
      // ensure createdAt exists on first write
      return this.toApi({ ...doc, createdAt: doc.createdAt ?? now });
    } else {
      // Create new document
      const doc: TaskDoc = {
        _id: new ObjectId(),
        projectId: setDoc.projectId!,
        title: setDoc.title!,
        status: setDoc.status!,
        assigneeId: setDoc.assigneeId,
        createdAt: now,
        updatedAt: now
      };
      await db.collection<TaskDoc>(COLL).insertOne(doc);
      return this.toApi(doc);
    }
  }

  async updateStatus(id: string, status: TaskStatus) {
  const db = await getDb();
  const coll = db.collection<TaskDoc>(COLL);
  const _id = new ObjectId(id);
  const now = new Date();

  // 1) Update
  const upd = await coll.updateOne(
    { _id },
    { $set: { status, updatedAt: now } }
  );
  if (upd.matchedCount === 0) throw new Error('Task not found');

  // 2) Read back the updated doc
  const value = await coll.findOne({ _id });
  if (!value) throw new Error('Task not found after update');

  return this.toApi(value);
}


  /**
   * Cursor pagination: sort by createdAt desc, then _id desc.
   * Cursor encodes { createdAtIso, idHex } of the last item.
   */
  async findPagedByProject(params: {
    projectId: string;
    status?: TaskStatus;
    assigneeId?: string;
    after?: string;
    limit: number;
  }) {
    await this.initIndexes();
    const db = await getDb();

    const q: Document = { projectId: new ObjectId(params.projectId) };
    if (params.status) q.status = params.status;
    if (params.assigneeId) q.assigneeId = new ObjectId(params.assigneeId);

    const sort: Document = { createdAt: -1, _id: -1 };

    if (params.after) {
      const { createdAtIso, idHex } = decodeCursor(params.after);
      const createdAt = new Date(createdAtIso);
      q.$or = [
        { createdAt: { $lt: createdAt } },
        { createdAt, _id: { $lt: new ObjectId(idHex) } }
      ];
    }

    const items = await db
      .collection<TaskDoc>(COLL)
      .find(q)
      .sort(sort)
      .limit(params.limit + 1)
      .toArray();

    const edges = items.slice(0, params.limit);
    const hasMore = items.length > params.limit;

    const last = edges[edges.length - 1];
    const cursor = last
      ? encodeCursor(last.createdAt.toISOString(), last._id.toHexString())
      : undefined;

    return {
      edges: edges.map((x) => this.toApi(x)),
      cursor,
      hasMore
    };
  }
}
