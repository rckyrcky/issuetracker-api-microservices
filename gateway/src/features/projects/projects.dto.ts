import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ToTrim } from 'src/common/decorators';
import { validationErrorMessages } from 'src/common/messages';

export class NewProjectInputDto {
  @ApiProperty({
    description: 'project name',
    maxLength: 100,
    example: 'issue tracker',
  })
  @ToTrim()
  @IsNotEmpty({ message: validationErrorMessages.required })
  @IsString({ message: validationErrorMessages.invalid })
  @MaxLength(100, {
    message: ({ constraints, property }) =>
      validationErrorMessages.max(constraints[0] as number, property),
  })
  name: string;
}

export class UpdateProjectInputDto extends NewProjectInputDto {}
