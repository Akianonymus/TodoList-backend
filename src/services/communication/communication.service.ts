import { Injectable } from '@nestjs/common';
import { MailjetService } from '../vendors/mailjet/mailjet-service';
import { EmailParams } from '../vendors/mailjet/interface';
import { Types } from 'mongoose';

@Injectable()
export class CommunicationService {
  constructor(private mailService: MailjetService) {}

  async sendEmail(args: EmailParams, emailVariables?: any) {
    try {
      const mail = await this.mailService.sendEmail(args, emailVariables);
    } catch (err) {
      throw err;
    }
  }

  async sendEmailOtp(email: string, templateId: number, emailVariables?: any) {
    try {
      return await this.sendEmail(
        { toName: '', toEmail: email, templateId: templateId },
        emailVariables,
      );
    } catch (err) {
      throw err;
    }
  }

  async sendMsg() {}
}
