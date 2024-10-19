import { AccountDto } from '@alpharide/account/dto/account.dto';
import { Public } from '@alpharide/utils/common/decorators/public.decorator';
import { ApiServiceResponse } from '@alpharide/utils/common/decorators/service-response.dto';
import { BaseMessageDto } from '@alpharide/utils/common/dtos/base-message.dto';
import { IServiceResponse } from '@alpharide/utils/helpers/response-handler';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthOperatorService } from '../service/auth.operator.service';
import {
  AddBusinessDto,
  OperatorLoginDto,
  OperatorSignUpDto,
  OperStaffInviteRegDto,
  OprResetPassDto,
  OprSendOtpDto,
  VerifyOtpForgotPassDto,
} from '../dto/auth.operator.dto';
import { GetCurrentUser } from '@alpharide/utils/common/decorators/get-current-user.decorator';
import { CompanyEntity } from '@alpharide/server/database/entities/company.entity';

@ApiTags('Auth')
@Controller('auth/operator')
@ApiBearerAuth('access-token')
export class AuthOperatorController {
  constructor(private readonly authOperatorService: AuthOperatorService) {}

  // Operator web register
  @Public()
  @Post('register')
  @ApiServiceResponse(BaseMessageDto)
  @ApiOperation({ summary: 'Operator account registration' })
  async operatorSignUp(
    @Body() operatorSignUpDto: OperatorSignUpDto,
  ): Promise<IServiceResponse<BaseMessageDto>> {
    const data = await this.authOperatorService.operatorSignUp(
      operatorSignUpDto,
    );

    return {
      status: 200,
      message: 'success',
      data,
    };
  }

  // Operator staff invite register
  @Public()
  @Post('staff/invite/register')
  @ApiServiceResponse(BaseMessageDto)
  @ApiOperation({ summary: 'Operator account registration' })
  async operStaffInviteReg(
    @Body() operStaffInviteRegDto: OperStaffInviteRegDto,
  ): Promise<IServiceResponse<BaseMessageDto>> {
    const data = await this.authOperatorService.operStaffInviteReg(
      operStaffInviteRegDto,
    );

    return {
      status: 200,
      message: 'success',
      data,
    };
  }

  // Operator web login
  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Log in on the opeartor web',
  })
  @ApiServiceResponse(AccountDto)
  async operatorLogin(
    @Body() { email, password }: OperatorLoginDto,
  ): Promise<IServiceResponse<AccountDto>> {
    const data = await this.authOperatorService.operatorLogin(email, password);

    return {
      status: 200,
      message: 'success',
      data,
    };
  }

  // Operator web staff login
  @Public()
  @Post('staff/login')
  @ApiOperation({
    summary: 'Login staff on the opeartor web',
  })
  @ApiServiceResponse(AccountDto)
  async operatorStaffLogin(
    @Body() { email, password }: OperatorLoginDto,
  ): Promise<IServiceResponse<AccountDto>> {
    const data = await this.authOperatorService.operatorStaffLogin(
      email.toLowerCase(),
      password,
    );

    return {
      status: 200,
      message: 'success',
      data,
    };
  }

  @Public()
  @Post('forgot-password')
  @ApiServiceResponse(BaseMessageDto)
  @ApiOperation({ summary: 'Operator forgot password send email' })
  async operatorForgotPassword(@Body() { email }: OprSendOtpDto) {
    const data = await this.authOperatorService.operatorSendOtp(email);

    return {
      message: 'OTP sent successfully.',
      status: 200,
      data,
    };
  }

  @Public()
  @Post('verify-otp-forgot-password')
  @ApiServiceResponse(BaseMessageDto)
  @ApiOperation({ summary: 'Operator forgot password send email' })
  async operatorVerifyOtp(@Body() { email, otp }: VerifyOtpForgotPassDto) {
    const data = await this.authOperatorService.operatorVerifyOtp(email, otp);

    return {
      message: 'OTP sent successfully.',
      status: 200,
      data,
    };
  }

  // Operator reset password
  @Public()
  @Post('reset-password')
  @ApiServiceResponse(BaseMessageDto)
  @ApiOperation({ summary: 'Operator forgot password send email' })
  async operatorResetPass(
    @Body() { email, password, confirmPassword }: OprResetPassDto,
  ) {
    const data = await this.authOperatorService.operatorResetPass(
      email,
      password,
      confirmPassword,
    );

    return {
      message: 'success',
      status: 200,
      data,
    };
  }

  // Add business detail
  @Public()
  @Post('company/add-bussiness-details')
  @ApiServiceResponse(AddBusinessDto)
  @ApiOperation({ summary: 'Operator: Add business detail' })
  async addBusiness(
    @GetCurrentUser('uid') userId: string,
    @Body() addBusinessDto: AddBusinessDto,
  ): Promise<IServiceResponse<AddBusinessDto>> {
    const data = await this.authOperatorService.addBusiness(
      userId,
      addBusinessDto,
    );

    return {
      status: 200,
      message: 'success',
      data,
    };
  }

  // Resend email verification OTP
  @Public()
  @Post('resend-email-otp')
  @ApiOperation({ summary: 'resend otp to email' })
  @ApiServiceResponse(AccountDto)
  async reSendEmailOtp(
    @Body() { email }: OprSendOtpDto,
  ): Promise<IServiceResponse<{ message: string }>> {
    const data = await this.authOperatorService.operatorSendOtp(email);
    return {
      message: 'success',
      status: 200,
      data,
    };
  }

  // NOT FOR INTEGRATION

  // Delete company besiness
  // @Delete('business/:businessId')
  async deleteBusiness(
    @Param('businessId') businessId: string,
  ): Promise<CompanyEntity> {
    return await this.authOperatorService.deleteBusiness(businessId);
  }

  // Create wallets for operators
  // @Get('create-wallet')
  async operatorWallet(): Promise<{ message: string }> {
    return await this.authOperatorService.operatorWallet();
  }

  // Get operators
  @Get('get-operators')
  async getOperators() {
    return await this.authOperatorService.getOperators();
  }
}
