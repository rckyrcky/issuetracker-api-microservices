import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ToTrim } from 'src/common/decorators';
import { validationErrorMessages } from 'src/common/messages';
import type { IssueStatusType, IssuePriorityType } from './issues.type';
import { ApiProperty } from '@nestjs/swagger';

export class NewIssueInputDto {
  @ApiProperty({
    description: 'issue title',
    example: 'login button not working',
    maxLength: 100,
  })
  @ToTrim()
  @IsNotEmpty({ message: validationErrorMessages.required })
  @IsString({ message: validationErrorMessages.invalid })
  @MaxLength(100, {
    message: ({ constraints, property }) =>
      validationErrorMessages.max(constraints[0] as number, property),
  })
  title: string;

  @ApiProperty({
    description: 'issue detailed description',
    example: 'login button is not responding',
    maxLength: 500,
  })
  @ToTrim()
  @IsNotEmpty({ message: validationErrorMessages.required })
  @IsString({ message: validationErrorMessages.invalid })
  @MaxLength(500, {
    message: ({ constraints, property }) =>
      validationErrorMessages.max(constraints[0] as number, property),
  })
  description: string;

  @ApiProperty({
    description: 'issue priority',
    enum: ['low', 'medium', 'high'],
    example: 'medium',
  })
  @IsIn(['low', 'medium', 'high'], { message: validationErrorMessages.invalid })
  priority: IssuePriorityType;
}

export class UpdateIssueInputDto extends NewIssueInputDto {
  @ApiProperty({
    description: 'issue status',
    enum: ['open', 'in progress', 'closed'],
    example: 'open',
  })
  @IsIn(['open', 'in progress', 'closed'], {
    message: validationErrorMessages.invalid,
  })
  status: IssueStatusType;
}
