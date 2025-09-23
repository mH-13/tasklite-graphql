import { Ctx, Query, Resolver } from 'type-graphql';
import { User } from '../types/User.js';
import { UsersRepo } from '../../repo/mongo/users.js';

type CtxType = {
  currentUserId: string;
  repos: { users: UsersRepo };
};

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() ctx: CtxType): Promise<User | null> {
    const doc = await ctx.repos.users.getById(ctx.currentUserId);
    if (!doc) return null;
    return { id: doc._id.toHexString(), email: doc.email, name: doc.name };
    }
}
