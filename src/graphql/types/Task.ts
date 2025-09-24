import 'reflect-metadata';
import { Field, ObjectType, ID } from 'type-graphql';
import { TaskStatus } from './enums.js';

@ObjectType()
export class Task {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  projectId!: string;

  @Field(() => String)
  title!: string;

  @Field(() => TaskStatus)
  status!: TaskStatus;

  @Field(() => ID, { nullable: true })
  assigneeId?: string;

  @Field(() => String)
  createdAt!: string;

  @Field(() => String)
  updatedAt!: string;
}
