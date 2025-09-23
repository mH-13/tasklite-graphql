import { registerEnumType } from 'type-graphql';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  ARCHIVED = 'ARCHIVED'
}
registerEnumType(TaskStatus, { name: 'TaskStatus' });
