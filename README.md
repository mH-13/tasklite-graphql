# tasklite-graphql

Minimal yet impactful GraphQL API (TypeScript + GraphQL Yoga + type-graphql + MongoDB).

## Run with Docker (recommended)
```bash
cp .env.example .env    # optional
docker compose up --build
# API: http://localhost:4000/graphql
# Mongo Express (optional): http://localhost:8081 (user/pass: admin/admin)
```

### Dev-mode auth

In GraphiQL, add a header:

```x-user-id: 64b2a8f1b1c2d3e4f5a6b7c8```


## GraphQL surface (5 APIs)

**Queries**

1. `me`
2. `tasks(projectId, status?, assigneeId?, after?, limit=20)`

**Mutations**

3. `createProject(name, key)`
4. `upsertTask(input)`
5. `updateTaskStatus(id, status)`

## Try it (GraphiQL)

1. Create a project

```graphql
mutation {
  createProject(name: "Maveric Lite", key: "MVL") {
    id name key owner { id email }
  }
}
```

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

**Run in terminal:**

```bash
docker compose up --build
```

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

```bash
npm ci
cp .env.example .env
npm run dev
```

Open the same GraphiQL URL and follow the same steps.


### Why this structure is “minimal yet impactful”

* Only **3 entities** and **5 APIs**, but I coverd:

  * **Schema design** (types + input)
  * **Resolvers** (thin, focused)
  * **Repository layer** (Mongo, indexes, pagination)
  * **Context** (fake auth + repos)
  * **Cursor pagination**
  * **Dockerized local infra**

