import { Public } from '@gowagr/common/decorators/public.decorator';
import { ResponseDto } from '@gowagr/common/interface/response.interface';
import { CreateUserDto } from '@gowagr/user/dto/index.dto';
import { UserService } from '@gowagr/user/service/user.service';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from '../dto/auth.dto';

import { AuthService } from '../services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Post('login')
  async loginAccount(@Body() body: LoginDto): Promise<ResponseDto> {
    const account = await this.authService.loginAccount(body);
    return {
      statusCode: 200,
      message: 'success',
      data: account,
    };
  }

  @Public()
  @Post('register')
  async createAccount(@Body() body: CreateUserDto): Promise<ResponseDto> {
    const res = await this.userService.createUser(body);
    return {
      statusCode: 200,
      message: 'success',
      data: res,
    };
  }
}
