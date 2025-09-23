import 'reflect-metadata';
import { Field, ObjectType, ID } from 'type-graphql';

@ObjectType()
export class User {
  @Field(() => ID) id!: string;
  @Field() email!: string;
  @Field({ nullable: true }) name?: string;
}
