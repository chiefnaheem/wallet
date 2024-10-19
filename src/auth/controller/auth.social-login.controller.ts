import { Public } from '@alpharide/utils/common/decorators/public.decorator';
import { ApiServiceResponse } from '@alpharide/utils/common/decorators/service-response.dto';
import { BaseMessageDto } from '@alpharide/utils/common/dtos/base-message.dto';
import { Body, Controller, Post } from '@nestjs/common';
import { AppleLoginDto, SocialLoginDto } from '../dto/social-login.dto';
import { IServiceResponse } from '@alpharide/utils/helpers/response-handler';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SocialLoginService } from '../service/social-login.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Social Login')
@Controller('social-login')
export class SocialLoginController {
  constructor(
    private readonly socialLoginService: SocialLoginService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Public()
  @Post('google-login')
  @ApiOperation({ summary: 'Log in with google' })
  @ApiServiceResponse(BaseMessageDto)
  async googleLogin(
    @Body() socialLoginDto: SocialLoginDto,
  ): Promise<IServiceResponse<BaseMessageDto | any>> {
    const data = await this.socialLoginService.googleLogin(socialLoginDto);
    return {
      data,
      message: 'success',
      status: 200,
    };
  }

  @Public()
  @Post('apple-login')
  @ApiOperation({ summary: 'Log in with apple' })
  @ApiServiceResponse(BaseMessageDto)
  async appleLogin(
    @Body() appleLoginDto: AppleLoginDto,
  ): Promise<IServiceResponse<BaseMessageDto | any>> {
    const data = await this.socialLoginService.appleLogin(appleLoginDto);
    return {
      data,
      message: 'success',
      status: 200,
    };
  }
}
