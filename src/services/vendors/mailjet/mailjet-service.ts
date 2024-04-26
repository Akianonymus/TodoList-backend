import { Injectable } from '@nestjs/common';
import { Client, LibraryResponse, SendEmailV3_1, Message } from 'node-mailjet';
import { vendorConsts } from '../consts';
import { EmailParams } from './interface';
import { getSecret } from 'src/secrets';
import SecretKeys from 'src/secrets/keys';
import { CommStatus } from 'src/services/communication/interfaces';

@Injectable()
export class MailjetService {
  private mj: Client;

  constructor() {
    this.mj = new Client({
      apiKey: getSecret(SecretKeys.VENDOR_MAILJET_KEY),
      apiSecret: getSecret(SecretKeys.VENDOR_MAILJET_SECRET),
    });
  }

  async checkEmailStatus(id: string) {
    try {
      const status: LibraryResponse<Message.GetMessagesResponse> = await this.mj
        .get('message', {
          version: vendorConsts.MAILJET_GETINFO_VERSION,
        })
        .id(id)
        .request();
      switch (status.response.data?.Data?.[0]?.Status) {
        case Message.CurrentMessageStatus.Deferred:
        case Message.CurrentMessageStatus.Queued:
          return CommStatus.QUEUE;
        case Message.CurrentMessageStatus.Sent:
          return CommStatus.SENT;
        case Message.CurrentMessageStatus.Opened:
          return CommStatus.OPENED;
        case Message.CurrentMessageStatus.Clicked:
          return CommStatus.CLICKED;
        case Message.CurrentMessageStatus.Unsub:
          return CommStatus.UNSUB;
        case Message.CurrentMessageStatus.Spam:
          return CommStatus.SPAM;
        case Message.CurrentMessageStatus.Bounce:
        case Message.CurrentMessageStatus.Blocked:
        case Message.CurrentMessageStatus.HardBounced:
        case Message.CurrentMessageStatus.SoftBounced:
          return CommStatus.BOUNCED;
        case Message.CurrentMessageStatus.Unknown:
        default:
          return CommStatus.UNKNOWN;
      }
    } catch (err) {
      throw err;
    }
  }

  async sendEmail(args: EmailParams, variables: any) {
    const { toEmail, toName, templateId } = args;

    const data: SendEmailV3_1.Body = {
      Messages: [
        {
          From: {
            Email: getSecret(SecretKeys.VENDOR_MAILJET_EMAIL),
            Name: getSecret(SecretKeys.VENDOR_MAILJET_EMAIL_NAME),
          },
          To: [{ Email: toEmail, Name: toName }],
          TemplateID: templateId,
          Variables: variables,
          Headers: { TemplateLanguage: vendorConsts.MAILJET_TEMPLATE_LANGUAGE },
        },
      ],
    };

    try {
      const result: LibraryResponse<SendEmailV3_1.Response> = await this.mj
        .post('send', { version: vendorConsts.MAILJET_VERSION })
        .request(data);

      const sent = result?.body?.Messages?.[0];
      if (sent?.Status === 'success') {
        return { messageId: sent?.To?.[0].MessageID, status: CommStatus.SENT };
      } else {
        throw new Error('Send Email Failed');
      }
    } catch (err) {
      throw err;
    }
  }
}
