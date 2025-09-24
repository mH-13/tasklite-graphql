import 'reflect-metadata';
import { Field, ObjectType, ID } from 'type-graphql';
import { User } from './User.js';

@ObjectType()
export class Project {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  key!: string;

  @Field(() => User)
  owner!: User;
}
