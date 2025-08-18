import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { CreateCommunityDto } from './dtos/create-community-dto';
import { CommunitiesResponse } from 'src/common/interfaces/community-interfaces';
import { Visibility } from 'src/common/enums/visibility-enum';
import { CacheInterceptor } from '@nestjs/cache-manager';

@UseInterceptors(CacheInterceptor)
@Controller('communities')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post()
  async createCommunity(@Body() body: CreateCommunityDto, @Req() req: any) {
    return this.communityService.createCommunity(body, String(req.user.sub));
  }
  @Get()
  async getCommunities(
    @Query('visibility') visibility: Visibility = Visibility.PUBLIC,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<CommunitiesResponse> {
    return this.communityService.getCommunities(visibility, page, limit);
  }
  @Get(':slug')
  async getCommunity(@Param('slug') slug: string) {
    return this.communityService.getCommunityBySlug(slug);
  }
  @Put(':slug')
  async updateCommunity(
    @Param('slug') slug: string,
    @Body() body: Partial<CreateCommunityDto>,
    @Req() req: any,
  ) {
    return this.communityService.updateCommunity(
      slug,
      body,
      String(req.user.sub),
    );
  }

  // @Get(':slug/members')
  // async getCommunityMembers(@Param('slug') slug: string) {
  //   return this.communityService.getCommunityMembers(slug);
  // }
}
