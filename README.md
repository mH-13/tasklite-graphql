# tasklite-graphql
Minimal yet impactful GraphQL API (TypeScript + GraphQL Yoga + type-graphql + MongoDB).

Repo Structure
```

├─ docker-compose.yml          # API + Mongo + Mongo Express
├─ Dockerfile                  # Container build/run
├─ package.json                # Scripts
├─ tsconfig.json               # TS config (decorators enabled)
├─ src/
│  ├─ index.ts                 # Server bootstrap
│  ├─ config/env.ts            # Env (PORT, MONGO_URI, ...)
│  ├─ graphql/                 # Schema, resolvers, types
│  ├─ repo/mongo/              # Mongo client + repos
│  └─ utils/pagination.ts
└─ LICENSE
```

About
- Compact GraphQL API (TypeScript + GraphQL Yoga + type-graphql + MongoDB).

Docs
- Start/run, GraphiQL examples, and troubleshooting: see `DEV.md`.


## Run with Docker (recommended)
```bash
cp .env.example .env    # optional
docker compose up -d --build
# API: http://localhost:4000/graphql
# Mongo Express (optional): http://localhost:8081 (user/pass: admin/admin)
```

### Dev-mode auth

In GraphiQL (Headers panel), add:

```
{ "x-user-id": "64b2a8f1b1c2d3e4f5a6b7c8" }
```


## GraphQL surface (5 APIs)

**Queries**

1. `me`
2. `tasks(projectId: ID!, status?, assigneeId?: ID, after?, limit=20)`

**Mutations**

3. `createProject(name: String!, key: String!)`
4. `upsertTask(input: UpsertTaskInput!)`
5. `updateTaskStatus(id: ID!, status: TaskStatus!)`

## Try it (GraphiQL)

1. Create a project

```graphql
mutation {
  createProject(name: "Maveric Lite", key: "MVL") {
    id name key owner { id email }
  }
}
```
Note: `key` is normalized to uppercase, and creating the same `key` again for the same user returns the existing project (idempotent).

2. Upsert tasks

```graphql
mutation($pid: ID!) {
  t1: upsertTask(input:{ projectId: $pid, title:"Plan schema", status:IN_PROGRESS }) { id title status }
  t2: upsertTask(input:{ projectId: $pid, title:"Wire Mongo repo", status:TODO }) { id title status }
}
```

3. List tasks (paginated)

```graphql
query($pid: ID!) {
  tasks(projectId:$pid, limit:1) {
    edges { id title status createdAt }
    cursor
    hasMore
  }
}
```

4. Update status

```graphql
mutation($id: ID!) {
  updateTaskStatus(id:$id, status:DONE) { id title status updatedAt }
}
```

5. Overwrite via upsert

```graphql
mutation($id: ID!, $pid: ID!) {
  upsertTask(input:{ id:$id, projectId:$pid, title:"Plan schema v2", status:DONE }) {
    id title status updatedAt
  }
}
```




### Run it With Docker

**Run in terminal (detached):**

```bash
docker compose up -d --build
```

View logs: `docker compose logs -f api`

Open **[http://localhost:4000/graphql](http://localhost:4000/graphql)** 

In GraphiQL (top-right “Headers” button), add:

```
{ "x-user-id": "64b2a8f1b1c2d3e4f5a6b7c8" }
```

Now run the mutations/queries from the README in order:

1. `createProject` → copy the returned `id` as `$pid`.
2. `upsertTask` (twice).
3. `tasks` with `projectId = $pid`.
4. `updateTaskStatus` with the `id` from a task.
5. `upsertTask` again with `id` to overwrite title/status.

### Without Docker (optional)

Run MongoDB locally or via Docker, then start the API locally.

Option A — local Mongo service listening on 27017:

```bash
npm ci
# ensure mongod is running (e.g. system service)
npm run dev
```

Option B — only Mongo in Docker and app locally (for live reload):

```bash
docker compose up -d mongo
npm ci
MONGO_URI=mongodb://localhost:27017 npm run dev
```

Note: Compose runs the API without hot reload (cleaner setup).
For live reload, prefer running only Mongo in Docker and the app locally.
`.env.example` is tuned for Docker (`MONGO_URI=mongodb://mongo:27017`).
For local runs, either omit `.env` or set `MONGO_URI` to `mongodb://localhost:27017`.
Open the same GraphiQL URL and follow the same steps.

### Troubleshooting

- Port 4000 in use: stop the other process (`lsof -i :4000` → `kill <pid>`) or run `PORT=4001 npm run dev`.
- Mongo connection refused: start Mongo locally, or run `docker compose up -d mongo`, and ensure `MONGO_URI` points to the running instance.


### Why this structure is “minimal yet impactful”

* Only **3 entities** and **5 APIs**, but I coverd:

  * **Schema design** (types + input)
  * **Resolvers** (thin, focused)
  * **Repository layer** (Mongo, indexes, pagination)
  * **Context** (fake auth + repos)
  * **Cursor pagination**
  * **Dockerized local infra**
