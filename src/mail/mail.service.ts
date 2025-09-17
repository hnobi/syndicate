import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    @InjectQueue('email') private readonly mailQueue: Queue, // Inject queue
  ) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  /** Synchronous email sending (optional, for immediate send) */
  async sendMail(to: string, subject: string, html: string): Promise<void> {
    await this.transporter.sendMail({
      from: `Syndicate <${this.configService.get<string>('EMAIL_USER')}>`,
      to,
      subject,
      html,
    });
  }

  /** Queue the welcome email */
  async queueWelcomeEmail(to: string, name: string) {
    await this.mailQueue.add('welcome', { to, name });
  }

  /** Queue joined-community email */
  async queueJoinedCommunityEmail(to: string, communityName: string) {
    await this.mailQueue.add('joinedCommunity', { to, communityName });
  }
}
