import serverConfig from '@gowagr/server/config/env.config';
import {
  createParamDecorator,
  ExecutionContext,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';

export const GetCurrentUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext): string => {
    const request = context?.switchToHttp()?.getRequest();

    const jwt = new JwtService();

    if (request.headers && request.headers.authorization) {
      const authorization = request.headers.authorization.split(' ')[1];

      if (!authorization) {
        throw new NotFoundException('You are not logged in');
      }

      let decoded: JwtPayload;

      try {
        decoded = jwt.verify(authorization, {
          secret: serverConfig.JWT_SECRET,
          ignoreExpiration: false,
        });

        return decoded.id;
      } catch (error) {
        if (
          error?.name?.toLowerCase().includes('token') ||
          error?.message?.toLowerCase().includes('expired')
        ) {
          throw new UnauthorizedException('Session Expired!');
        }
        // ErrorHandler.handleError('Decorator.get-current-user-id', error);
      }
    } else {
      throw new NotFoundException('Access Token not present');
    }
  },
);
