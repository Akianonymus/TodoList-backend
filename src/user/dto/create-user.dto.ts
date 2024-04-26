import { IsNotEmpty, IsString, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsEmail()
  email: string;

  @MinLength(6, {
    message: 'password too short',
  })
  @IsNotEmpty()
  password: string;
}
