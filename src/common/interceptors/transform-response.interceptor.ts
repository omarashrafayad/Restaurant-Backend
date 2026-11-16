import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { PaginatedResult } from '../data-accsess/base-repository.js';

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((response: unknown) => {
        // Case 1: Empty response
        if (response === undefined || response === null) {
          return { data: [] };
        }

        // Case 2: PaginatedResult response
        if (response instanceof PaginatedResult) {
          return {
            data: response.data,
            meta: {
              totalCount: response.totalCount,
              page: response.page,
              limit: response.limit,
              pageCount: response.pageCount,
            },
          };
        }

        // Case 3: Already enveloped ({ data }, auth { token }, or a bare { status?, message })
        if (typeof response === 'object' && !Array.isArray(response)) {
          const keys = Object.keys(response);
          const isEnvelope = keys.includes('data') || keys.includes('token');
          const isBareMessage =
            keys.includes('message') && keys.every((k) => k === 'message' || k === 'status');
          if (isEnvelope || isBareMessage) return response;
        }

        // Case 4: Regular payload
        return { data: response };
      }),
    );
  }
}
