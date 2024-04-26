import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { CustomJwtModule } from '../utils/custom-jwt/custom-jwt.module';

@Module({
  imports: [forwardRef(() => UserModule), CustomJwtModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
