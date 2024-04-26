import { Module } from '@nestjs/common';
import { MailjetService } from '../vendors/mailjet/mailjet-service';
import { CommunicationService } from './communication.service';

@Module({
  imports: [],
  providers: [MailjetService, CommunicationService],
  exports: [CommunicationService],
})
export class CommunicationModule {}
