import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGaurd } from '../auth/auth.gaurd';
import { Public } from '../utils/auth';
import { HandleExceptionResponse } from '../utils/custom-response';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto/reset-password.dto';

@Controller('user')
@UseGuards(AuthGaurd)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      return await this.userService.forgotPassword(forgotPasswordDto);
    } catch (err) {
      return HandleExceptionResponse('Forgot Password Request Failed', err);
    }
  }

  @Public()
  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    try {
      return await this.userService.verifyOtp(verifyOtpDto);
    } catch (err) {
      return HandleExceptionResponse('Verify OTP failed', err);
    }
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      return await this.userService.resetPassword(resetPasswordDto);
    } catch (err) {
      return HandleExceptionResponse('Reset password failed', err);
    }
  }
}
