import 'reflect-metadata';
import { Field, ObjectType } from 'type-graphql';
import { Task } from './Task.js';

@ObjectType()
export class TaskConnection {
  @Field(() => [Task]) edges!: Task[];
  @Field({ nullable: true }) cursor?: string;
  @Field() hasMore!: boolean;
}
