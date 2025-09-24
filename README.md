# TaskLite GraphQL

A tiny kanban-style API with 5 ops. Minimal yet impactful GraphQL API for task management built with TypeScript, GraphQL Yoga, type-graphql, and MongoDB.

## Features

- **Type-safe GraphQL API** with automatic schema generation
- **Cursor-based pagination** for efficient data loading
- **Idempotent operations** for reliable API behavior
- **Docker-ready** development environment
- **Clean architecture** with repository pattern

## Tech Stack

- **Backend**: TypeScript, GraphQL Yoga, type-graphql
- **Database**: MongoDB with optimized indexes
- **Development**: Docker, tsx, Mongo Express
- **Architecture**: 4-layer design (API → GraphQL → Repository → Database)


## Project Structure

```
src/
├── index.ts              # Server bootstrap
├── config/env.ts         # Environment configuration
├── graphql/
│   ├── schema.ts         # Schema builder
│   ├── types/            # GraphQL types & inputs
│   └── resolvers/        # Query & mutation resolvers
├── repo/mongo/           # Database repositories
└── utils/pagination.ts   # Cursor pagination utilities
```

## Architecture Flow

```
Client Request
      ↓
┌─────────────┐
│ GraphQL API │ ← Parse, validate, route
└─────────────┘
      ↓
┌─────────────┐
│  Resolvers  │ ← Business logic
└─────────────┘
      ↓
┌─────────────┐
│ Repositories│ ← Data access
└─────────────┘
      ↓
┌─────────────┐
│   MongoDB   │ ← Storage
└─────────────┘
```

**Request Flow:**
1. **GraphQL Yoga** → Parse & validate queries
2. **Context** → Inject auth + repositories
3. **Resolvers** → Handle business logic
4. **Repositories** → Manage data operations
5. **MongoDB** → Store & retrieve data


## Quick Start

```bash
# Clone and run with Docker (recommended)
docker compose up -d --build

# API available at: http://localhost:4000/graphql
# Mongo Express: http://localhost:8081 (admin/admin)
```

**Authentication (dev mode)**: Add header in GraphiQL:
```json
{ "x-user-id": "64b2a8f1b1c2d3e4f5a6b7c8" }
```

## API Overview

**5 GraphQL Operations:**

**Queries:**
- `me` - Get current user
- `tasks(projectId, status?, assigneeId?, after?, limit)` - List tasks with pagination

**Mutations:**
- `createProject(name, key)` - Create project (idempotent)
- `upsertTask(input)` - Create or update task
- `updateTaskStatus(id, status)` - Update task status

## Example Usage

```graphql
# 1. Create project
mutation {
  createProject(name: "My Project", key: "MP") {
    id name key owner { email }
  }
}

# 2. Add tasks
mutation($pid: ID!) {
  upsertTask(input: { projectId: $pid, title: "Setup API", status: IN_PROGRESS }) {
    id title status
  }
}

# 3. List tasks
query($pid: ID!) {
  tasks(projectId: $pid) {
    edges { id title status createdAt }
    hasMore cursor
  }
}
```

## Development

For detailed setup instructions, GraphiQL examples, troubleshooting, and local development options, see **[DEV.md](./DEV.md)**.
