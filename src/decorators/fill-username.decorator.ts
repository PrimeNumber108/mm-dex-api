import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    UseInterceptors,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Interceptor to modify the request body
@Injectable()
export class FillUsernameInterceptor implements NestInterceptor {
    constructor() { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();

        const username = request.headers['username'];

        request.body['username'] = username;

        return next.handle().pipe(map((data) => data));
    }
}

export function FillUsername() {
    return UseInterceptors(new FillUsernameInterceptor());
}
