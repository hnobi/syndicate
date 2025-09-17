import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'email' }), // I added this one queue for email and payment processing, you can add more as needed
  ],
  exports: [BullModule],
})
export class QueueModule {}
