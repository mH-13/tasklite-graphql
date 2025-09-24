import 'reflect-metadata';
import { Field, ObjectType, ID } from 'type-graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id!: string;

  @Field(() => String)                // ← explicit
  email!: string;

  @Field(() => String, { nullable: true })  // ← explicit
  name?: string;
}
