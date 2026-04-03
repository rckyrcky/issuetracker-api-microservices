import { Type } from 'class-transformer';
import { IsOptional, IsInt, IsNumber } from 'class-validator';
import { validationErrorMessages } from '../messages';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ParamsDto {
  @ApiPropertyOptional({
    description: 'project id',
    example: 1,
    type: Number,
    default: undefined,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: validationErrorMessages.invalid })
  @IsInt({ message: validationErrorMessages.invalid })
  project_id?: number;

  @ApiPropertyOptional({
    description: 'issue id',
    example: 1,
    type: Number,
    default: undefined,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: validationErrorMessages.invalid })
  @IsInt({ message: validationErrorMessages.invalid })
  issue_id?: number;

  @ApiPropertyOptional({
    description: 'comment id',
    example: 1,
    type: Number,
    default: undefined,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: validationErrorMessages.invalid })
  @IsInt({ message: validationErrorMessages.invalid })
  comment_id?: number;

  @ApiPropertyOptional({
    description: 'notification id',
    example: 1,
    type: Number,
    default: undefined,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: validationErrorMessages.invalid })
  @IsInt({ message: validationErrorMessages.invalid })
  notification_id?: number;
}
