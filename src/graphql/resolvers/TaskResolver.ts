import { Arg, Ctx, ID, Int, Mutation, Query, Resolver } from 'type-graphql';
import { Task } from '../types/Task.js';
import { TaskConnection } from '../types/TaskConnection.js';
import { UpsertTaskInput } from '../types/inputs.js';
import { TaskStatus } from '../types/enums.js';
import { TasksRepo } from '../../repo/mongo/tasks.js';
import { ProjectsRepo } from '../../repo/mongo/projects.js';
import { UsersRepo } from '../../repo/mongo/users.js';

type CtxType = {
  currentUserId: string;
  repos: { tasks: TasksRepo; projects: ProjectsRepo; users: UsersRepo };
};

@Resolver()
export class TaskResolver {
  @Query(() => TaskConnection)
  async tasks(
    @Arg('projectId', () => ID) projectId: string,
    @Arg('status', () => TaskStatus, { nullable: true }) status: TaskStatus | undefined,
    @Arg('assigneeId', () => ID, { nullable: true }) assigneeId: string | undefined,
    @Arg('after', () => String, { nullable: true }) after: string | undefined,
    @Arg('limit', () => Int, { defaultValue: 20 }) limit: number,
    @Ctx() ctx: CtxType
  ): Promise<TaskConnection> {
    // (RBAC skipped for demo)
    return ctx.repos.tasks.findPagedByProject({ projectId, status, assigneeId, after, limit });
  }

  @Mutation(() => Task)
  async upsertTask(
    @Arg('input', () => UpsertTaskInput) input: UpsertTaskInput,
    @Ctx() ctx: CtxType
  ): Promise<Task> {
    const p = await ctx.repos.projects.getById(input.projectId);
    if (!p) throw new Error('Project not found');
    return ctx.repos.tasks.upsert(input);
  }

  @Mutation(() => Task)
  async updateTaskStatus(
    @Arg('id', () => ID) id: string,
    @Arg('status', () => TaskStatus) status: TaskStatus,
    @Ctx() ctx: CtxType
  ): Promise<Task> {
    return ctx.repos.tasks.updateStatus(id, status);
  }
}
