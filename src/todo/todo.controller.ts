import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Body,
  Delete,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { AuthGaurd } from 'src/auth/auth.gaurd';
import { HandleExceptionResponse } from 'src/utils/custom-response';
import { CustomExpressRequest } from 'src/auth/interfaces';
import { CreateTodoDto, DeleteTodoDto, UpdateTodoDto } from './dto/todo.dto';

@Controller('todo')
@UseGuards(AuthGaurd)
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get('')
  async todos(@Request() req: CustomExpressRequest) {
    try {
      return await this.todoService.todos(req.user);
    } catch (err) {
      return HandleExceptionResponse('Todos fetching failed', err);
    }
  }

  @Post('create')
  async createTodo(
    @Request() req: CustomExpressRequest,
    @Body() createTodoDto: CreateTodoDto,
  ) {
    try {
      return await this.todoService.createTodo(req.user, createTodoDto);
    } catch (err) {
      return HandleExceptionResponse('Todos fetching failed', err);
    }
  }

  @Post('update')
  async updateTodo(@Body() updateTodoDto: UpdateTodoDto) {
    try {
      return await this.todoService.updateTodo(updateTodoDto);
    } catch (err) {
      return HandleExceptionResponse('Todos fetching failed', err);
    }
  }

  @Delete('delete')
  async deleteTodo(@Body() deleteTodoDto: DeleteTodoDto) {
    try {
      return await this.todoService.deleteTodo(deleteTodoDto);
    } catch (err) {
      return HandleExceptionResponse('Todos fetching failed', err);
    }
  }

  @Delete('deleteAll')
  async deleteAllTodo(@Request() req: CustomExpressRequest) {
    try {
      return await this.todoService.deleteAllTodo(req.user);
    } catch (err) {
      return HandleExceptionResponse('Todos fetching failed', err);
    }
  }
}
