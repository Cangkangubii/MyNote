import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password;
}