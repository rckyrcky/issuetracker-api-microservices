import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { Channel, Message } from 'amqplib';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ServerError } from '../exceptions';

@Injectable()
export class RmqActInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const ctx = context.switchToRpc().getContext<RmqContext>();
    const channel = ctx.getChannelRef() as Channel;
    const message = ctx.getMessage() as Message;

    return next.handle().pipe(
      tap({
        next: () => channel.ack(message),
      }),
      catchError((error: unknown) => {
        const headers = message.properties.headers || {};
        const retryCount = (headers['x-retry-count'] as number) || 0;

        if (!(error instanceof ServerError)) {
          channel.ack(message);
          return throwError(() => error);
        }

        if (retryCount < 3) {
          console.log(
            `[RETRY] Count ${retryCount + 1}, sending to notification_retry_queue, from ${message.fields.routingKey}`,
          );
          channel.sendToQueue('notification_retry_queue', message.content, {
            headers: { ...headers, 'x-retry-count': retryCount + 1 },
          });
          channel.ack(message);
        } else {
          console.log(`[DLQ] Retry limit reached, sending to DLQ`);
          channel.nack(message, false, false);
        }
        return throwError(() => error);
      }),
    );
  }
}
