import { UserDto } from '@gowagr/user/dto/index.dto';
import { PickType } from '@nestjs/swagger';

export class LoginDto extends PickType(UserDto, [
  'email',
  'password',
] as const) {}
