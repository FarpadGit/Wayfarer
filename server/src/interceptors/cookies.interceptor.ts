import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services/user/user.service';

@Injectable()
export class cookiesInterceptor implements NestInterceptor {
  constructor(private userService: UserService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<FastifyRequest>();
    const res = context.switchToHttp().getResponse<FastifyReply>();

    // before pass to controllers
    if (!req.cookies.userId) {
      req.cookies.userId = this.userService.GUEST_USER_ID;
      res.clearCookie('userId');
      res.setCookie('userId', this.userService.GUEST_USER_ID, { path: '/' });
    }

    return next.handle().pipe(
      tap({
        next: (returnValue) => {
          // after pass to controllers
          res.headers({ userId: req.cookies.userId });
          return res.send(returnValue);
        },
        error: (error) => {
          // after controller threw an error
          console.error(error.message);
          return res.internalServerError(
            'Sajnos ismeretlen eredetű hiba történt a szerver oldalán.',
          );
        },
      }),
    );
  }
}
