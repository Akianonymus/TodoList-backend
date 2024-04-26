import {
  IsString,
  IsEmail,
  MinLength,
  IsNotEmpty,
  IsNumber,
  IsMongoId,
} from 'class-validator';
import { Types } from 'mongoose';

export class ForgotPasswordDto {
  @IsString()
  @IsEmail()
  email: string;
}

export class VerifyOtpDto {
  @IsNumber()
  otp: number;

  @IsMongoId()
  resetID: Types.ObjectId;
}

export class ResetPasswordDto {
  @IsMongoId()
  resetId: Types.ObjectId;

  @MinLength(6, { message: 'password too short' })
  @IsNotEmpty()
  password: string;
}
