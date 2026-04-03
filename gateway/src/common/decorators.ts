import { applyDecorators, SetMetadata } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';
import { validationErrorMessages } from './messages';

export const SKIP_AUTH_GUARD = 'skipAuthGuard';

export const ToTrim = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );

export const ToLowerCase = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  );

export const Email = () =>
  applyDecorators(
    ToTrim(),
    ToLowerCase(),
    IsEmail({}, { message: validationErrorMessages.type.email }),
  );

export const SkipAuthGuard = () => SetMetadata(SKIP_AUTH_GUARD, true);
