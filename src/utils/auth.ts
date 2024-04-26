import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY, TokenType } from '../consts';
import { TokenDto } from '../auth/dto/token.dto';
import { CustomJwtService } from './custom-jwt/custom-jwt.service';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export async function checkAccessToken(
  jwtService: CustomJwtService,
  token: string,
): Promise<TokenDto> {
  const payload: TokenDto = await jwtService.verifyToken(
    token,
    TokenType.ACCESS,
  );
  if (payload?.tokenType !== TokenType.ACCESS || !payload?.userId) {
    throw Error('Invalid Access token');
  }
  return payload;
}

export async function checkRefreshToken(
  jwtService: CustomJwtService,
  token: string,
): Promise<TokenDto> {
  const payload: TokenDto = await jwtService.verifyToken(
    token,
    TokenType.REFRESH,
  );
  if (payload?.tokenType !== TokenType.REFRESH || !payload?.userId) {
    throw Error('Invalid Refresh token');
  }
  return payload;
}
