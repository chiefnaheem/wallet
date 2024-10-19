import serverConfig from '@gowagr/server/config/env.config';
import {
  ExecutionContext,
  NotFoundException,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, JwtPayloadWithRt } from 'src/auth/interfaces';

export const GetCurrentUser = createParamDecorator(
  (data: keyof JwtPayloadWithRt | undefined, context: ExecutionContext) => {
    const request = context?.switchToHttp()?.getRequest();

    const jwt = new JwtService();

    if (request.headers && request.headers.authorization) {
      const authorization = request.headers.authorization.split(' ')[1];

      if (!authorization) {
        throw new NotFoundException('You are not logged in');
      }

      let decoded: JwtPayload;
      console.log('auth', authorization);
      try {
        decoded = jwt.verify(authorization, {
          secret: serverConfig.JWT_SECRET,
          ignoreExpiration: false,
        });

        return data ? decoded?.[data] : decoded;
      } catch (error) {
        if (
          error?.name?.toLowerCase().includes('token') ||
          error?.message?.toLowerCase().includes('expired')
        ) {
          throw new UnauthorizedException('Session Expired!');
        }
        // ErrorHandler.handleError('Decorator.get-current-user', error);
      }
    } else {
      throw new NotFoundException('Access Token not present');
    }
  },
);
