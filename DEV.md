# Development Guide

This guide covers running the project smoothly and using GraphiQL with correct examples.

URLs

- GraphiQL: http://localhost:4000/graphql
- Mongo Express (optional): http://localhost:8081 (user/pass: admin/admin)

Headers (dev auth)

- In GraphiQL → Headers, add:

```
{ "x-user-id": "64b2a8f1b1c2d3e4f5a6b7c8" }
```

Run with Docker (recommended)

- Build & run detached:

```
docker compose up -d --build
```

- Logs: `docker compose logs -f api`
- Stop: `docker compose down -v`

Environment variables

- PORT: API port (default 4000)
- MONGO_URI: Mongo connection string
  - Docker default: `mongodb://mongo:27017`
  - Local dev: `mongodb://localhost:27017`
- MONGO_DB: Database name (default `tasklite`)
- JWT_SECRET: Dev-only secret (not used for auth flows here)

Run locally (optional)
Option A — local Mongo service (listening on 27017):

```
npm ci
# ensure mongod is running (system service)
npm run dev
```

Option B — Mongo in Docker, app locally (live reload):

```
docker compose up -d mongo
npm ci
MONGO_URI=mongodb://localhost:27017 npm run dev
```

Note: `.env.example` is tuned for Docker (`MONGO_URI=mongodb://mongo:27017`). For local runs, omit `.env` or set `MONGO_URI=mongodb://localhost:27017`.

GraphQL API surface

- Queries:
  - `me`
  - `tasks(projectId: ID!, status?, assigneeId?: ID, after?, limit=20)`
- Mutations:
  - `createProject(name: String!, key: String!)`
  - `upsertTask(input: UpsertTaskInput!)`
  - `updateTaskStatus(id: ID!, status: TaskStatus!)`

Types and scalars

- All identifiers use the `ID` scalar throughout inputs, arguments, and object fields (`id`, `projectId`, `assigneeId`). Values are transferred as strings in responses.

Working examples (GraphiQL)

1. Create a project (copy its `id`):

```graphql
mutation {
  createProject(name: "Maveric Lite", key: "MVL") {
    id
    name
    key
  }
}
```
Notes:
- The `key` is normalized to uppercase.
- Re-running `createProject` with the same `key` for the same user returns the existing project instead of failing (idempotent).

2. Upsert two tasks for that project (uses variable of type ID!):

```graphql
mutation ($pid: ID!) {
  t1: upsertTask(
    input: { projectId: $pid, title: "Plan schema", status: IN_PROGRESS }
  ) {
    id
    title
    status
  }
  t2: upsertTask(
    input: { projectId: $pid, title: "Wire Mongo repo", status: TODO }
  ) {
    id
    title
    status
  }
}
```

Variables:

```
{ "pid": "PASTE_PROJECT_ID" }
```

3. List tasks (projectId is an ID!):

```graphql
query ($pid: ID!) {
  tasks(projectId: $pid, limit: 1) {
    edges {
      id
      title
      status
      createdAt
    }
    cursor
    hasMore
  }
}
```

Variables:

```
{ "pid": "PASTE_PROJECT_ID" }
```

4. Update a task status (task `id` is an ID!):

```graphql
mutation ($id: ID!) {
  updateTaskStatus(id: $id, status: DONE) {
    id
    title
    status
    updatedAt
  }
}
```

Variables:

```
{ "id": "PASTE_TASK_ID" }
```

Getting IDs again later

- Create a new project and use its `id`.
- Mongo Express → DB `tasklite` → collection `projects` → copy `_id`.
- `mongosh`:

```
mongosh mongodb://localhost:27017/tasklite \
  --eval 'db.projects.find({}, {_id:1,name:1,key:1}).sort({_id:-1}).limit(5).toArray()'
```

- To get a task id: run the `tasks` query for your project and copy an `edges[].id`.

Common pitfalls and fixes

- Variable type mismatch:
  - Ensure variables use the `ID` type for identifier arguments (e.g., `$pid: ID!`, `$id: ID!`).
- Missing variables:
  - Error: `Variable "$pid" of required type "..." was not provided.` → Add it under GraphiQL “Variables”.
- Port 4000 in use:
  - `lsof -i :4000 -nP | grep LISTEN` → `kill <pid>` or run `PORT=4001 npm run dev`.
- Mongo connection refused:
  - Ensure Mongo is running (`docker compose up -d mongo` or local service) and `MONGO_URI` points to it.
- Mongo Express password:
  - Username: `admin`, Password: `admin` (set in `docker-compose.yml`).

Notes

- Identifiers consistently use the `ID` scalar across inputs, arguments, and object fields.
