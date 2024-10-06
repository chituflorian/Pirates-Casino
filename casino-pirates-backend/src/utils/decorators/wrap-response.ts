import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { RequestResponse } from '../types/request-response.dto';
import { Observable, catchError, map, of } from 'rxjs';

export function WrapResponse() {
  return UseInterceptors(new ResponseInterceptor<any>());
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<RequestResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const response = new RequestResponse<T>();
        response.data = data;
        response.message = 'ok';
        response.status = true;
        return response;
      }),
      catchError((err) => {
        // Assuming err has a message property
        const response = new RequestResponse<T>();
        response.data = null;
        response.message =
          err.message !== 'Http Exception'
            ? err.message
            : Object.values(err.response?.errors ?? {})[0];
        response.status = false;
        return of(response);
      }),
    );
  }
}
