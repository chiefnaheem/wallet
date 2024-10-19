import { AccountDto } from '@alpharide/account/dto/account.dto';
import { AccountService } from '@alpharide/account/service/account.service';
import { emailTemplates } from '@alpharide/mail/emailTemplates';
import { MailsService } from '@alpharide/mail/mail.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { OtpService } from './otp.service';
import * as argon from 'argon2';
import { AuthService } from './auth.service';
import {
  AccountEntity,
  PlatformTypesEnum,
} from '@alpharide/server/database/entities/account.entity';
import {
  AddBusinessDto,
  OperatorSignUpDto,
  OperStaffInviteRegDto,
} from '../dto/auth.operator.dto';
import { CompanyEntity } from '@alpharide/server/database/entities/company.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletService } from '@alpharide/finance/wallet/wallet.service';
import { StaffService } from '@alpharide/staff/staff.service';
import { CryptoService } from './crypto.service';
import { Secret } from '@alpharide/utils/types/types';

@Injectable()
export class AuthOperatorService {
  constructor(
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
    private readonly accountService: AccountService,
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
    private readonly mailService: MailsService,
    private readonly walletService: WalletService,
    private readonly staffService: StaffService,
    private readonly cryptoService: CryptoService,
  ) {}

  // Create new user
  async operatorSignUp(
    operatorSignUpDto: OperatorSignUpDto,
  ): Promise<{ message: string }> {
    try {
      const { email, password, platform } = operatorSignUpDto;

      const lowerCaseEmail = email.toLowerCase();

      // Check if account already exists
      const account = await this.accountService.findAccountByEmail(
        lowerCaseEmail,
      );

      if (account) throw new Error('User with the email already exists');

      const hashedPassword = await this.accountService.hashData(password);

      const payload = {
        ...operatorSignUpDto,
        email: lowerCaseEmail,
        password: hashedPassword,
        isBusinessAdded:
          platform === PlatformTypesEnum.OPERATOR_COMPANY ? false : null,
      };

      const operator = await this.accountService.operatorAccount(payload);

      const code = await this.otpService.generateOtp(email, 15);

      const walletDto = {
        balance: '0.00',
        ledgerBalance: '0.00',
        totalEarning: '0.00',
        totalExpense: '0.00',
        netProfit: '0.00',
        currency: 'NGN',
        lisbonEarning: '0.00',
        lisbonWallet: '0.00',
      };

      await this.walletService.createWallet(operator?.id, walletDto);

      await this.mailService.emailProcessor({
        to: lowerCaseEmail,
        subject: 'Email Verification',
        template: emailTemplates.emailVerification,
        data: { otp: code.toString() },
      });

      return {
        message:
          'Email Verification is required, please check your email for OTP',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Operator staff invite register
  async operStaffInviteReg(
    operStaffInviteRegDto: OperStaffInviteRegDto,
  ): Promise<{ message: string }> {
    try {
      const { secret, password, ...rest } = operStaffInviteRegDto;

      const decryptedData = this.cryptoService.decrypt(secret);

      const { email, operatorId }: Secret = JSON.parse(decryptedData);

      const hashedPassword = await this.accountService.hashData(password);

      const oprStaff = await this.staffService.addOpratorStaff({
        ...rest,
        operatorId,
        email,
        password: hashedPassword,
      });

      const { accessToken, refreshToken } = await this.authService.getTokens({
        uid: oprStaff.id,
        email,
      });

      const sanitizedUser = await this.accountService.sanitizeUser({
        ...oprStaff,
      });

      return { ...sanitizedUser, accessToken };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Operator web login
  async operatorLogin(email: string, password: string): Promise<AccountDto> {
    try {
      const lowerCaseEmail = email.toLowerCase();

      // Check if account exist
      const account = await this.accountService.findAccountByEmail(
        lowerCaseEmail,
      );

      // await this.accountService.validatePlatform(account);

      if (!account || !account?.password)
        throw new Error('Invalid credentials!');

      const isPasswordValid = await this.verifyHashData(
        account.password,
        password,
      );

      if (!isPasswordValid) throw new Error('Invalid credentials!');

      const { accessToken, refreshToken } = await this.authService.getTokens({
        uid: account.id,
        email: account.email,
        platform: account?.platform,
      });
      await this.authService.updateRefreshToken(account?.id, refreshToken);

      const sanitizedUser = await this.accountService.sanitizeUser({
        ...account,
      });

      return { ...sanitizedUser, accessToken };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Operator web login
  async operatorStaffLogin(
    email: string,
    password: string,
  ): Promise<AccountDto> {
    try {
      // Check if account exist
      const opratorStaff = await this.staffService.findStaffWithEmail(email);

      if (!opratorStaff) {
        throw new Error(`Staff not found.`);
      }

      if (!opratorStaff?.password) throw new Error('Invalid credentials!');

      const isPasswordValid = await this.verifyHashData(
        opratorStaff.password,
        password,
      );

      if (!isPasswordValid) throw new Error('Invalid credentials!');

      const { accessToken, refreshToken } = await this.authService.getTokens({
        uid: opratorStaff.id,
        email: opratorStaff.email,
      });

      const sanitizedUser = await this.accountService.sanitizeUser({
        ...opratorStaff,
      });

      return { ...sanitizedUser, accessToken };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Operaror forgot passsword
  async operatorSendOtp(email: string): Promise<{ message: string }> {
    try {
      const account = await this.accountService.findAccountByEmail(email);

      if (!account) throw new Error('Account not found.');

      const code = await this.otpService.generateOtp(email, 15); // Send OTP. Expires in 1 minute

      await this.mailService.emailProcessor({
        to: email.toLowerCase(),
        subject: 'Email Verification',
        template: emailTemplates.emailVerification,
        data: { otp: code.toString() },
      });

      return { message: 'OTP sent to your email.' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Operaror verify OTP forgot passsword
  async operatorVerifyOtp(
    email: string,
    otp: string,
  ): Promise<{ message: string }> {
    try {
      await this.otpService.verifyOtp({
        phoneNumberOrEmail: email,
        code: otp,
      });

      return { message: 'OTP successfully verified.' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Operaror verify OTP forgot passsword
  async operatorResetPass(
    email: string,
    password: string,
    confirmPassword: string,
  ): Promise<{ message: string }> {
    try {
      if (password !== confirmPassword)
        throw new Error('Password and confirm password do not match');

      const account = await this.accountService.findAccountByEmail(email);

      if (!account) throw new Error('Account not found.');

      const hashedPassword = await this.accountService.hashData(password);

      await this.accountService.updateAccount(
        '',
        {
          password: hashedPassword,
        },
        account,
      );

      return { message: 'Your password is successfully updated' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Add business detail
  async addBusiness(
    userId: string,
    addBusinessDto: AddBusinessDto,
  ): Promise<AddBusinessDto> {
    try {
      // Fetch the user account
      const user = await this.accountService.findOneWithException(userId);

      if (user.platform === PlatformTypesEnum.OPERATOR_INDIVIDUAL)
        throw new Error(
          'Sorry you cannot add a business company to an individual opeartor account',
        );

      // Create a new CompanyEntity instance
      const company = new CompanyEntity();
      company.name = addBusinessDto.name;
      company.companyRegNo = addBusinessDto.companyRegNo;
      company.country = addBusinessDto.country;
      company.stateOfOperation = addBusinessDto.stateOfOperation;
      company.logo = addBusinessDto.logo;
      company.fleetType = addBusinessDto.fleetType;
      company.noOfEmployee = addBusinessDto.noOfEmployee;
      company.industry = addBusinessDto.industry;
      company.services = addBusinessDto.services;

      // Set the relation
      company.user = user;

      // Update user
      await this.accountService.updateAccount(
        '',
        { isBusinessAdded: true },
        user,
      );

      // Save the company entity
      const savedCompany = await this.companyRepository.save(company);

      return savedCompany;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Verify hash password
  async verifyHashData(
    userPassword: string,
    password: string,
  ): Promise<boolean> {
    try {
      return await argon.verify(userPassword, password);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Delete company
  async deleteBusiness(businessId: string): Promise<CompanyEntity> {
    try {
      // Find the company to delete
      const company = await this.companyRepository.findOne({
        where: { id: businessId },
      });

      if (!company) {
        throw new Error(`Company with ID ${businessId} not found`);
      }

      // Remove the company
      return await this.companyRepository.remove(company);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Create wallets for operators
  async operatorWallet(): Promise<{ message: string }> {
    try {
      const operators = await this.accountService.getOperators();

      const walletDto = {
        balance: '0.00',
        ledgerBalance: '0.00',
        totalEarning: '0.00',
        totalExpense: '0.00',
        netProfit: '0.00',
        currency: 'NGN',
        lisbonEarning: '0.00',
        lisbonWallet: '0.00',
      };

      await Promise.all(
        operators.map((operator) =>
          this.walletService.createWallet(operator.id, walletDto),
        ),
      );

      return { message: `Wallets created for ${operators.length} operators` };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Get operators
  async getOperators(): Promise<AccountEntity[]> {
    try {
      return await this.accountService.getOperators();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
