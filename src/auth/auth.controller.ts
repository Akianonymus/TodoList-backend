import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { RefreshAccessTokenDto } from './dto/refresh-access-token.dto';
import CustomResponse, {
  HandleExceptionResponse,
} from '../utils/custom-response';
import { APIConstants } from 'src/consts';
import { AuthGaurd } from './auth.gaurd';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGaurd)
  @Get('')
  async auth() {
    return CustomResponse(
      'User authorized',
      APIConstants.Status.Success,
      APIConstants.StatusCode.Ok,
    );
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.authService.register(createUserDto);
    } catch (err) {
      return HandleExceptionResponse('Register failed', err);
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (err) {
      return HandleExceptionResponse('Login failed', err);
    }
  }

  @Post('refreshAccessToken')
  async refreshAccessToken(@Body() refreshTokenDto: RefreshAccessTokenDto) {
    try {
      return await this.authService.refreshAccessToken(
        refreshTokenDto.refreshToken,
      );
    } catch (err) {
      return HandleExceptionResponse('Access token refresh failed', err);
    }
  }
}
