import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { CustomJwtModule } from '../utils/custom-jwt/custom-jwt.module';
import {
  ForgotPassword,
  ForgotPasswordSchema,
} from './schemas/forgot-password.schema';
import { CommunicationModule } from '../services/communication/communication.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ForgotPassword.name, schema: ForgotPasswordSchema },
    ]),
    CustomJwtModule,
    CommunicationModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
