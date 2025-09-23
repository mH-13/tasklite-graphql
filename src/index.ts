import 'reflect-metadata';
import { createServer } from 'http';
import { createYoga } from 'graphql-yoga';
import { makeSchema } from './graphql/schema.js';
import { env } from './config/env.js';
import { UsersRepo } from './repo/mongo/users.js';
import { ProjectsRepo } from './repo/mongo/projects.js';
import { TasksRepo } from './repo/mongo/tasks.js';

/**
 * Dev-only auth:
 * - Read x-user-id header (must be a 24-char hex)
 * - If missing/invalid, fall back to a fixed ObjectId-like value
 */
function getUserIdFromHeader(headers: Headers): string {
  const raw = headers.get('x-user-id');
  if (raw && /^[0-9a-f]{24}$/.test(raw)) return raw;
  return '64b2a8f1b1c2d3e4f5a6b7c8'; // deterministic, dev only
}

(async () => {
  const schema = await makeSchema();

  const yoga = createYoga({
    schema,
    context: async ({ request }) => {
      const currentUserId = getUserIdFromHeader(request.headers);
      const repos = {
        users: new UsersRepo(),
        projects: new ProjectsRepo(),
        tasks: new TasksRepo()
      };
      // ensure dev user exists so `me` works immediately
      await repos.users.ensureUser(currentUserId);
      return { currentUserId, repos };
    },
    graphiql: true
  });

  const server = createServer(yoga);
  server.listen(env.port, () => {
    console.log(`GraphQL ready at http://localhost:${env.port}/graphql`);
  });
})();
