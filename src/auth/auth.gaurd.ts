import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { toObjectId } from '../utils';
import { Reflector } from '@nestjs/core';
import { checkAccessToken } from '../utils/auth';
import { isMongoId } from 'class-validator';
import { IS_PUBLIC_KEY } from '../consts';
import { CustomJwtService } from '../utils/custom-jwt/custom-jwt.service';

@Injectable()
export class AuthGaurd implements CanActivate {
  constructor(
    private jwtService: CustomJwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const isPublic = this.reflector.getAllAndOverride<boolean>(
        IS_PUBLIC_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (isPublic) return true;

      const req = context.switchToHttp().getRequest();
      const token = req.cookies?.access_token || req.headers?.access_token;

      if (!token) {
        throw Error('Access Token not passed with headers');
      }

      const payload = await checkAccessToken(this.jwtService, token);
      payload.userId = toObjectId(payload.userId);

      req['user'] = payload;

      return true;
    } catch (err) {
      return false;
    }
  }
}
