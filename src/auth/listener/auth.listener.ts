import { emailTemplates } from '@alpharide/mail/emailTemplates';
import { MailsService } from '@alpharide/mail/mail.service';
import { PlatformTypesEnum } from '@alpharide/server/database/entities/account.entity';
import { SmsService } from '@alpharide/sms/sms.service';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuthEvents } from '../events/index.event';

@Injectable()
export class AuthListener {
  private logger = new Logger('Auth Listener');
  constructor(
    private readonly mailService: MailsService,
    private readonly smsService: SmsService,
  ) {}

  // @OnEvent(AuthEvents.CREATE_ACCOUNT)
  // async handleSendVerificationCode(payload: {
  //   code: string;
  //   name: string;
  //   email: string;
  //   meta: any;
  // }): Promise<void> {
  //   try {
  //     const { code, email, name, meta } = payload;
  //     const text = `Your OTP is ${code}`;

  //     if (meta === 'Invite') {
  //       await this.mailService.sendEmail({
  //         to: email,
  //         subject: 'Invitation to LisBon',
  //         template: emailTemplates.inviteUser,
  //         data: { otp: code, name },
  //       });
  //       return;
  //     }

  //     await this.mailService.sendEmail({
  //       to: email,
  //       subject: 'Email Verification',
  //       template: emailTemplates.emailVerification,
  //       data: { otp: code.toString() },
  //     });
  //   } catch (error) {
  //     this.logger.error(error);
  //     throw error;
  //   }
  // }

  @OnEvent(AuthEvents.CREATE_ACCOUNT)
  async handleSendVerificationCode(payload: {
    code: string;
    name: string;
    email?: string;
    phone?: string;
    platform?: string;
    meta: any;
  }): Promise<void> {
    try {
      const { code, email, phone, name, meta, platform } = payload;
      const text = `You have been invited to join our platform by ${name}. Use this link to sign up: ${code}`;

      if (meta === 'Invite') {
        if (email) {
          await this.mailService.sendEmail({
            to: email,
            subject: 'Invitation to LisBon',
            template: emailTemplates.inviteUser,
            data: { otp: code, name },
          });
        }

        if (phone) {
          //smsProcessor
          await this.smsService.smsProcessor(text, phone);
        }
        return;
      }
      if (meta === 'phone-otp' && email) {
        await this.mailService.sendEmail({
          to: email,
          subject: 'Your LisBon phone number OTP is Here!',
          template: emailTemplates.sendPhoneOtp,
          data: { otp: code, name },
        });

        return;
      }

      if (meta === 'welcome' && email) {
        const templates = {
          [PlatformTypesEnum.CUSTOMER]: emailTemplates.customerWelcome,
          [PlatformTypesEnum.DRIVER]: emailTemplates.driverWelcome,
          [PlatformTypesEnum.ONLINE_VENDOR]: emailTemplates.vendorWelcome,
        };

        const template = templates[platform] || emailTemplates.vendorWelcome;

        await this.mailService.sendEmail({
          to: email,
          subject: 'Welcome to LisBon!!🎉🎊',
          template,
          data: { userName: name },
        });

        return;
      }

      if (email) {
        await this.mailService.sendEmail({
          to: email,
          subject: 'Email Verification',
          template: emailTemplates.emailVerification,
          data: { otp: code.toString() },
        });
      }

      if (phone) {
        //smsProcessor
        await this.smsService.sendMessageOnbuka(text, phone);
      }
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @OnEvent(AuthEvents.LOGIN_ACCOUNT)
  async handleLoginNotification(payload: {
    name: string;
    email?: string;
    phone?: string;
    meta?: any;
  }): Promise<void> {
    try {
      const { email, phone, name, meta } = payload;

      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Africa/Lagos',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };

      const formattedDateTime = new Date().toLocaleString('en-US', options);

      await this.mailService.sendEmail({
        to: email,
        subject: 'Login Notification',
        template: emailTemplates.loginNotification,
        data: { userName: name, dateTime: formattedDateTime },
      });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @OnEvent(AuthEvents.FORGOT_PASSWORD)
  async handleForgotPassword(payload: {
    name: string;
    email: string;
    link: string;
  }): Promise<void> {
    try {
      const { email, link, name } = payload;

      await this.mailService.sendEmail({
        to: email,
        subject: 'Reset Password',
        template: emailTemplates.forgotPasswordEmail,
        data: { name, link },
      });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
