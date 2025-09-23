import 'reflect-metadata';
import { Field, ID, InputType } from 'type-graphql';
import { TaskStatus } from './enums.js';
import { IsIn, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpsertTaskInput {
  @Field(() => ID, { nullable: true }) id?: string; // if omitted -> create
  @Field(() => ID) projectId!: string;
  @Field() title!: string;

  @Field(() => TaskStatus, { nullable: true })
  @IsOptional()
  @IsIn(Object.values(TaskStatus))
  status?: TaskStatus;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  assigneeId?: string;
}
