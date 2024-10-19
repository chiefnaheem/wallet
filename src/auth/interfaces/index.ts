import { PlatformTypesEnum } from '@alpharide/server/database/entities/account.entity';
import { ApiProperty } from '@nestjs/swagger';

export type JwtPayload = {
  uid: string;
  email?: string;
  name?: string;
  phoneNumber?: string;
  platform?: PlatformTypesEnum;
};

export type JwtPayloadWithRt = JwtPayload & { refreshToken: string };

export class Tokens {
  @ApiProperty()
  accessToken: string;
  @ApiProperty()
  refreshToken: string;
}
