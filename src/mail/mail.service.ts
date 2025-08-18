import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
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

  private async sendMail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    await this.transporter.sendMail({
      from: `Syndicate <${this.configService.get<string>('EMAIL_USER')}>`,
      to,
      subject,
      html,
    });
  }

  async JoinedCommunityEmail(to: string, communityName: string): Promise<void> {
    const subject = `You have joined ${communityName}`;
    const html = `
      <h1>Welcome to ${communityName}!</h1>
      <p>Thank you for joining the community. We are excited to have you on board!</p>
      <p>Feel free to explore and connect with others.</p>
    `;
    await this.sendMail(to, subject, html);
  }
  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const subject = '🎉 Welcome to Syndicate!';
    const html = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <h1 style="color: #4CAF50;">Welcome, ${name} 👋</h1>
      <p>
        We're excited to have you join <strong>Syndicate</strong> — your space to connect, share, 
        and grow with communities that matter.
      </p>

      <p>You now have two ways to get started:</p>
      <ul>
        <li>🌟 <strong>Create your own community</strong> — Build a space for your ideas, projects, or interests.</li>
        <li>🤝 <strong>Join existing communities</strong> — Discover and connect with like-minded people.</li>
      </ul>

      <p>
        Whether you want to start something new or be part of something bigger, 
        Syndicate gives you the tools to make it happen.
      </p>

      <div style="margin: 20px 0;">
        <a href="https://syndicate.com/create-community"
           style="display:inline-block; margin-right:10px; padding:12px 20px; 
                  background-color:#4CAF50; color:#fff; text-decoration:none; 
                  border-radius:6px; font-weight:bold;">
          Create a Community
        </a>
        <a href="https://syndicate.com/explore"
           style="display:inline-block; padding:12px 20px; 
                  background-color:#2196F3; color:#fff; text-decoration:none; 
                  border-radius:6px; font-weight:bold;">
          Explore Communities
        </a>
      </div>

      <p style="margin-top: 20px; font-size: 0.9em; color: #777;">
        Cheers,<br/>The Syndicate Team
      </p>
    </div>
  `;
    await this.sendMail(to, subject, html);
  }
}
