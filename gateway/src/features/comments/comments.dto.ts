import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ToTrim } from 'src/common/decorators';
import { validationErrorMessages } from 'src/common/messages';

export class NewCommentInputDto {
  @ApiProperty({
    description: 'the content of comment',
    maxLength: 500,
    example: 'i am working on it',
  })
  @ToTrim()
  @IsNotEmpty({ message: validationErrorMessages.required })
  @IsString({ message: validationErrorMessages.invalid })
  @MaxLength(500, {
    message: ({ constraints, property }) =>
      validationErrorMessages.max(constraints[0] as number, property),
  })
  content: string;
}
