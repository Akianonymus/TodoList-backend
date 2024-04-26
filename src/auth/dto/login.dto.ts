import { IsEmail, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @MinLength(6, {
    message: 'password too short',
  })
  password: string;
}
