import 'reflect-metadata';
import { Field, ObjectType, ID } from 'type-graphql';
import { TaskStatus } from './enums.js';

@ObjectType()
export class Task {
  @Field(() => ID) id!: string;
  @Field() projectId!: string;
  @Field() title!: string;
  @Field(() => TaskStatus) status!: TaskStatus;
  @Field({ nullable: true }) assigneeId?: string;
  @Field() createdAt!: string;
  @Field() updatedAt!: string;
}
