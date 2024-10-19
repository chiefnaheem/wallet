import { ApiProperty } from '@nestjs/swagger';

export type JwtPayload = {
  uid: string;
  email?: string;
  phoneNumber?: string;
};

export type JwtPayloadWithRt = JwtPayload & { refreshToken: string };

export class Tokens {
  @ApiProperty()
  accessToken: string;
  @ApiProperty()
  refreshToken: string;
}
