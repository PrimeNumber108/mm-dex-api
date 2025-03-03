import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    UseInterceptors,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CryptoHelper } from 'src/libs/utils/crypto-helper';

// Interceptor to modify the request body
@Injectable()
export class DecodeBodyInterceptor implements NestInterceptor {
    constructor() { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();

        request.body = JSON.parse(CryptoHelper.decrypt(request.body));

        return next.handle().pipe(map((data) => data));
    }
}

export function DecodeBody() {
    return UseInterceptors(new DecodeBodyInterceptor());
}