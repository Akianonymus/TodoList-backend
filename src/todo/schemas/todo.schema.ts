import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

export type TodoDocument = Todo & Document;

export enum TodoStatus {
  COMPLETED = 'completed',
  ON_HOLD = 'hold',
  IN_PROGRESS = 'progress',
}

@Schema({ timestamps: true })
export class Todo {
  @Prop({ required: true, ref: User.name, type: Types.ObjectId })
  userId: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, enum: TodoStatus, default: TodoStatus.IN_PROGRESS })
  status: TodoStatus;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
