import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';
import { Project } from '../types/Project.js';
import { ProjectsRepo } from '../../repo/mongo/projects.js';
import { UsersRepo } from '../../repo/mongo/users.js';

type CtxType = {
  currentUserId: string;
  repos: { users: UsersRepo; projects: ProjectsRepo };
};

@Resolver()
export class ProjectResolver {
  @Mutation(() => Project)
  async createProject(
    @Arg('name', () => String) name: string,
    @Arg('key', () => String) key: string,
    @Ctx() ctx: CtxType
  ): Promise<Project> {
    const owner = await ctx.repos.users.ensureUser(ctx.currentUserId);
    const p = await ctx.repos.projects.create(name, key, ctx.currentUserId);
    return {
      id: p._id.toHexString(),
      name: p.name,
      key: p.key,
      owner: { id: owner._id.toHexString(), email: owner.email, name: owner.name }
    };
  }
}
