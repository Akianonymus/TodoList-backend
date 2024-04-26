import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { TokenType } from 'src/consts';

export class TokenDto {
  @IsMongoId()
  userId: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  @IsEnum(TokenType)
  tokenType: TokenType;
}
