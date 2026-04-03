import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { validationErrorMessages } from '../messages';
import { ToTrim } from '../decorators';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type {
  IssueStatusType,
  IssuePriorityType,
} from 'src/features/issues/issues.type';

export class QueryDto {
  @ApiPropertyOptional({
    description: 'page of pagination',
    example: 1,
    type: Number,
    default: undefined,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: validationErrorMessages.invalid })
  @Min(1, { message: validationErrorMessages.invalid })
  page?: number;

  @ApiPropertyOptional({
    description: 'issue status',
    example: 'open',
    enum: ['open', 'in progress', 'closed'],
    default: undefined,
  })
  @IsOptional()
  @IsIn(['open', 'in progress', 'closed'], {
    message: validationErrorMessages.invalid,
  })
  status?: IssueStatusType;

  @ApiPropertyOptional({
    description: 'issue priority',
    example: 'low',
    enum: ['low', 'medium', 'high'],
    default: undefined,
  })
  @IsOptional()
  @IsIn(['low', 'medium', 'high'], { message: validationErrorMessages.invalid })
  priority?: IssuePriorityType;

  @ApiPropertyOptional({
    description: 'order by date ascending or descending',
    example: 'ascending',
    enum: ['ascending', 'descending'],
    default: undefined,
  })
  @IsOptional()
  @IsIn(['ascending', 'descending'], {
    message: validationErrorMessages.invalid,
  })
  orderByDate?: 'ascending' | 'descending';

  @ApiPropertyOptional({
    description: 'cursor',
    example: 1,
    type: Number,
    default: undefined,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: validationErrorMessages.invalid })
  @Min(1, { message: validationErrorMessages.invalid })
  cursor?: number;

  @ApiPropertyOptional({
    description: 'search keyword',
    example: 'john',
    type: 'string',
    default: undefined,
  })
  @IsOptional()
  @ToTrim()
  @IsNotEmpty({ message: validationErrorMessages.required })
  @IsString({ message: validationErrorMessages.invalid })
  @MaxLength(20, {
    message: ({ constraints, property }) =>
      validationErrorMessages.max(constraints[0] as number, property),
  })
  search?: string;
}
