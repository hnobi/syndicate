import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CreateCommunityDto } from './dtos/create-community-dto';

@Controller('communities')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post()
  async createCommunity(@Body() body: CreateCommunityDto, @Req() req: any) {
    return this.communityService.createCommunity(body, String(req.user.sub));
  }
  @Get()
  async getCommunities(@Req() req: any): Promise<any> {
    const { visibility = 'public', page = 1, limit = 20 } = req.query;
    return this.communityService.getCommunities(
      visibility,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }
}
