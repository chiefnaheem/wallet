import serverConfig from '@gowagr/server/config/env.config';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { type JwtPayload, type JwtPayloadWithRt } from '../interfaces';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: serverConfig.REFRESH_TOKEN_SECRET,
      passReqToCallback: true,
    });
  }

  /**
   * Validates the request and payload to return the JwtPayloadWithRt.
   *
   * @param {Request} req - The request object.
   * @param {JwtPayload} payload - The JWT payload.
   * @returns {JwtPayloadWithRt} - The JWT payload with the refresh token.
   */
  validate(req: Request, payload: JwtPayload): JwtPayloadWithRt {
    const refreshToken = req
      ?.get('authorization')
      ?.replace('Bearer', '')
      .trim();

    if (!refreshToken) throw new ForbiddenException('Refresh token malformed');

    return {
      ...payload,
      refreshToken,
    };
  }
}
