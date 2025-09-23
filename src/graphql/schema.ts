import { buildSchema } from 'type-graphql';
import { UserResolver } from './resolvers/UserResolver.js';
import { ProjectResolver } from './resolvers/ProjectResolver.js';
import { TaskResolver } from './resolvers/TaskResolver.js';

export async function makeSchema() {
  return buildSchema({
    resolvers: [UserResolver, ProjectResolver, TaskResolver],
    validate: { forbidUnknownValues: false }
  });
}
