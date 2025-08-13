import { Body, Controller, Post, Req } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CreateCommunityDto } from './dtos/create-community-dto';

@Controller('communities')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post()
  async createCommunity(@Body() body: CreateCommunityDto, @Req() req: any) {
    return this.communityService.createCommunity(body, String(req.user.sub));
  }
}
