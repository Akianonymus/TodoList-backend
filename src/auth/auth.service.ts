import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { UserStatus } from '../user/schemas/user.schema';
import { APIConstants, TokenType } from '../consts';
import CustomResponse, {
  HandleExceptionResponse,
} from '../utils/custom-response';
import { checkRefreshToken } from '../utils/auth';
import { CustomJwtService } from '../utils/custom-jwt/custom-jwt.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: CustomJwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    return await this.userService.createUser(createUserDto);
  }

  async login(loginDto: LoginDto) {
    try {
      const existingUser = await this.userService.getUserInfo(
        { email: loginDto.email },
        { password: 1 },
      );

      if (
        !existingUser ||
        !(await this.jwtService.comparingPlainTextTohashed(
          loginDto.password,
          existingUser.password,
        ))
      ) {
        throw Error('Invalid email or password');
      }

      const jwtAccessToken = await this.jwtService.createToken(
        {
          userId: existingUser._id,
          tokenType: TokenType.ACCESS,
        },
        TokenType.ACCESS,
      );

      const jwtRefreshToken = await this.jwtService.createToken(
        {
          userId: existingUser._id,
          tokenType: TokenType.REFRESH,
        },
        TokenType.REFRESH,
      );

      return CustomResponse(
        'User Logged In Successfully',
        APIConstants.Status.Success,
        APIConstants.StatusCode.Ok,
        { accessToken: jwtAccessToken, refreshToken: jwtRefreshToken },
      );
    } catch (err) {
      return HandleExceptionResponse(
        'User login failed',
        err,
        APIConstants.StatusCode.BadRequest,
      );
    }
  }

  async refreshAccessToken(token: string) {
    try {
      const payload = await checkRefreshToken(this.jwtService, token);

      const validUser = await this.userService.validUser({
        _id: payload.userId,
        status: UserStatus.ACTIVE,
      });

      if (!validUser) {
        throw Error('Invalid Refresh token');
      }

      const jwtAccessToken = await this.jwtService.createToken(
        {
          userId: payload.userId,
          tokenType: TokenType.ACCESS,
        },
        TokenType.ACCESS,
      );

      return CustomResponse(
        'Access Token Generated Successfully',
        APIConstants.Status.Success,
        APIConstants.StatusCode.Ok,
        { accessToken: jwtAccessToken },
      );
    } catch (err) {
      return HandleExceptionResponse(
        'Access token refresh failed',
        err,
        APIConstants.StatusCode.BadRequest,
      );
    }
  }
}
