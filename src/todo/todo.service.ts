import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Todo, TodoDocument, TodoStatus } from './schemas/todo.schema';
import { Model } from 'mongoose';
import CustomResponse, {
  HandleExceptionResponse,
} from 'src/utils/custom-response';
import { APIConstants } from 'src/consts';
import { ReqUser } from 'src/auth/interfaces';
import { CreateTodoDto, DeleteTodoDto, UpdateTodoDto } from './dto/todo.dto';

@Injectable()
export class TodoService {
  constructor(
    @InjectModel(Todo.name) private readonly todoModel: Model<TodoDocument>,
  ) {}
  async todos(userObj: ReqUser) {
    try {
      const todos = await this.todoModel
        .find({ userId: userObj.userId })
        .lean();
      return CustomResponse(
        'Todos fetched Successfully',
        APIConstants.Status.Success,
        APIConstants.StatusCode.Ok,
        { todos: todos, total: todos.length },
      );
    } catch (error) {
      return HandleExceptionResponse(
        'Fetching todo failed',
        error,
        APIConstants.StatusCode.BadRequest,
      );
    }
  }

  async createTodo(userObj: ReqUser, createTodoDto: CreateTodoDto) {
    try {
      const newtodo = await new this.todoModel({
        content: createTodoDto.content,
        userId: userObj.userId,
      }).save();
      return CustomResponse(
        'Todo Created Successfully',
        APIConstants.Status.Success,
        APIConstants.StatusCode.Ok,
        { todo: newtodo },
      );
    } catch (error) {
      return HandleExceptionResponse(
        'Create todo failed',
        error,
        APIConstants.StatusCode.BadRequest,
      );
    }
  }

  async updateTodo(updateTodoDto: UpdateTodoDto) {
    try {
      if (updateTodoDto?.content && updateTodoDto?.status) {
        return CustomResponse(
          'No data to update',
          APIConstants.Status.Warning,
          APIConstants.StatusCode.NoContent,
        );
      }

      const updateDoc = {};

      if (updateTodoDto?.content) updateDoc['content'] = updateTodoDto.content;
      if (updateTodoDto?.status) updateDoc['status'] = updateTodoDto.status;

      await this.todoModel.findByIdAndUpdate(updateTodoDto.todoId, updateDoc);
      return CustomResponse(
        'Todo Updated Successfully',
        APIConstants.Status.Success,
        APIConstants.StatusCode.Ok,
      );
    } catch (error) {
      return HandleExceptionResponse(
        'Edit todo failed',
        error,
        APIConstants.StatusCode.BadRequest,
      );
    }
  }

  async deleteTodo(deleteTodoDto: DeleteTodoDto) {
    await this.todoModel.findByIdAndDelete(deleteTodoDto.todoId);
    try {
      return CustomResponse(
        'Todo deleted Successfully',
        APIConstants.Status.Success,
        APIConstants.StatusCode.Ok,
      );
    } catch (error) {
      return HandleExceptionResponse(
        'Delete todo failed',
        error,
        APIConstants.StatusCode.BadRequest,
      );
    }
  }

  async deleteAllTodo(userObj: ReqUser) {
    try {
      await this.todoModel.deleteMany({ userId: userObj.userId });
      return CustomResponse(
        'All todos successfully deleted',
        APIConstants.Status.Success,
        APIConstants.StatusCode.Ok,
      );
    } catch (error) {
      return HandleExceptionResponse(
        'DeleteAll todo failed',
        error,
        APIConstants.StatusCode.BadRequest,
      );
    }
  }
}
