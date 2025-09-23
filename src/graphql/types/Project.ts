import 'reflect-metadata';
import { Field, ObjectType, ID } from 'type-graphql';
import { User } from './User.js';

@ObjectType()
export class Project {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field() key!: string;
  @Field(() => User) owner!: User;
}
