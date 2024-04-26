import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { TodoStatus } from '../schemas/todo.schema';

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class UpdateTodoDto {
  @IsString()
  @IsOptional()
  content: string;

  @IsMongoId()
  todoId: Types.ObjectId;

  @IsEnum(TodoStatus)
  @IsOptional()
  status: TodoStatus;
}

export class DeleteTodoDto {
  @IsMongoId()
  todoId: Types.ObjectId;
}
