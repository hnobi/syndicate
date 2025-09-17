import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { MailService } from './mail.service';

@Processor('email') // Queue name
@Injectable()
export class MailProcessor extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job) {
    switch (job.name) {
      case 'welcome':
        await this.handleWelcome(job);
        break;
      case 'joinedCommunity':
        await this.handleJoinedCommunity(job);
        break;
      default:
        console.warn(`Unknown job: ${job.name}`);
    }
  }

  private async handleWelcome(job: Job) {
    const { to, name } = job.data;
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
    await this.mailService.sendMail(String(to), subject, html);
  }

  private async handleJoinedCommunity(job: Job) {
    const { to, communityName } = job.data;
    const subject = `You have joined ${communityName}`;
    const html = `
      <h1>Welcome to ${communityName}!</h1>
      <p>Thank you for joining the community. We are excited to have you on board!</p>
      <p>Feel free to explore and connect with others.</p>
    `;
    await this.mailService.sendMail(to, subject, html);
  }
}
