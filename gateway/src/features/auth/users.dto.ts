import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Email, ToTrim } from 'src/common/decorators';
import { validationErrorMessages } from 'src/common/messages';

export class UserSignupInputDto {
  @ApiProperty({
    description: 'user name',
    example: 'john doe',
    maxLength: 30,
  })
  @ToTrim()
  @IsNotEmpty({ message: validationErrorMessages.required })
  @IsString({ message: validationErrorMessages.invalid })
  @MaxLength(30, {
    message: ({ constraints, property }) =>
      validationErrorMessages.max(constraints[0] as number, property),
  })
  name: string;

  @ApiProperty({
    description: 'user email',
    example: 'john@example.com',
  })
  @Email()
  email: string;

  @ApiProperty({
    description: 'user password',
    minLength: 8,
    maxLength: 30,
  })
  @IsNotEmpty({ message: validationErrorMessages.required })
  @IsString({ message: validationErrorMessages.invalid })
  @MinLength(8, {
    message: ({ constraints, property }) =>
      validationErrorMessages.min(constraints[0] as number, property),
  })
  @MaxLength(30, {
    message: ({ constraints, property }) =>
      validationErrorMessages.max(constraints[0] as number, property),
  })
  password: string;
}

export class UserLoginInputDto {
  @ApiProperty()
  @Email()
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: validationErrorMessages.required })
  @IsString({ message: validationErrorMessages.invalid })
  password: string;
}

export class UserEditInputDto extends PartialType(UserSignupInputDto) {}
