import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Todo, TodoSchema } from './schemas/todo.schema';
import { CustomJwtModule } from 'src/utils/custom-jwt/custom-jwt.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Todo.name, schema: TodoSchema }]),
    CustomJwtModule,
  ],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
