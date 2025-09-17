import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import { QueueModule } from 'src/queue/queue.module';
import { MailProcessor } from './mail.processor';

@Module({
  imports: [ConfigModule, QueueModule],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
