import { Module } from '@nestjs/common';
import MongodbConnection from './db/mongo';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TodoModule } from './todo/todo.module';

@Module({
  imports: [MongodbConnection, UserModule, AuthModule, TodoModule],
  providers: [],
})
export class AppModule {}
