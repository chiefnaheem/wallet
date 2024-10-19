import { OtpEntity } from '@alpharide/server/database/entities/otp.entity';
import { IdentificationManager } from '@alpharide/utils/managers/identification.manager';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { addMinutes, isAfter } from 'date-fns';
import { Repository } from 'typeorm';
import { OtpDto } from '../dto/otp.dto';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(OtpEntity)
    private otpRepo: Repository<OtpEntity>,
  ) {}

  async generateOtp(
    phoneNumberOrEmail: string,
    time?: number,
    lengthParam?: number,
  ): Promise<string> {
    const existingOtps = await this.otpRepo.find({
      where: { phoneNumberOrEmail },
    });

    if (existingOtps.length > 0) {
      await this.otpRepo.remove(existingOtps);
    }

    const timeExpires = time || 15;

    const expiresAt = addMinutes(new Date(), timeExpires);

    const lengthOfString = lengthParam || 5;

    const code = IdentificationManager.generateCodeNumeric(lengthOfString);
    // const hashedCode = PasswordManager.hash(code);

    const otp = this.otpRepo.create({
      code, // Use the hashed code
      expiresAt,
      used: false,
      phoneNumberOrEmail,
    });

    const d = await this.otpRepo.save(otp);
    return code;
  }

  async verifyOtp(data: OtpDto): Promise<boolean> {
    const { code, phoneNumberOrEmail } = data;

    const codeExists = await this.otpRepo.findOne({
      where: { phoneNumberOrEmail },
    });

    if (!codeExists || codeExists.code !== code) {
      throw new BadRequestException('Invalid OTP provided');
    }

    if (codeExists.used) {
      throw new UnauthorizedException(
        'This OTP has been used, please generate a new one',
      );
    }

    if (isAfter(new Date(), new Date(codeExists.expiresAt))) {
      throw new UnauthorizedException(
        'This OTP has expired, please generate a new one',
      );
    }

    // const isMatch = PasswordManager.compare(code, codeExists.code);

    const newOtp = Object.assign(codeExists, { used: true });
    await this.otpRepo.save(newOtp);
    // return !!isMatch;\
    return true;
  }

  async resendOtp(phoneNumber: string): Promise<string> {
    const existingOtp = await this.otpRepo.findOne({
      where: { phoneNumberOrEmail: phoneNumber, used: false },
    });

    if (existingOtp) {
      await this.otpRepo.remove(existingOtp);
    }

    return await this.generateOtp(phoneNumber);
  }
}
