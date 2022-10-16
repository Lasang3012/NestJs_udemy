import { UserService } from '@app/user/user.service';
import { NestMiddleware, Injectable } from '@nestjs/common';
import { JWT_SECRET } from 'config';
import * as jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { ExpressRequest } from '@app/user/types/expressRequest.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: ExpressRequest, _: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      req.user = null;
      next();
      return;
    }

    const authHeaders = req.headers.authorization;
    if (authHeaders && (authHeaders as string).split(' ')[1]) {
      const token = (authHeaders as string).split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await this.userService.findById(decoded.id);
        req.user = user;
        next();
      } catch (err) {
        req.user = null;
        next();
      }
    }
  }
}
