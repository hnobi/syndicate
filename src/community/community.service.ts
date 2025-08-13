import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Community, CommunityDocument } from './schemas/community.schema';
import { Model } from 'mongoose';
import { CreateCommunityDto } from './dtos/create-community-dto';
import {
  CommunityMembers,
  CommunityMembersDocument,
} from './schemas/community-members.schema';
import { MemberRole } from 'src/common/enums/community-user.enum';

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel(Community.name)
    private readonly communityModel: Model<CommunityDocument>,
    @InjectModel(CommunityMembers.name)
    private readonly communityMembersModel: Model<CommunityMembersDocument>,
  ) {}

  async createCommunity(
    createCommunityDto: CreateCommunityDto,
    userId: string,
  ): Promise<Community> {
    const { name, description, avatar, coverImage, visibility } =
      createCommunityDto;
    let slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    try {
      const existingSlug = await this.communityModel.findOne({
        slug,
      });
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`;
      }

      const community = await this.communityModel.create({
        name,
        slug,
        avatar,
        coverImage,
        description,
        visibility,
        ownerId: userId,
        memberCount: 1,
      });
      if (!community) {
        throw new Error('Community creation failed');
      }

      await this.createCommunityMember(
        userId,
        community._id as string,
        MemberRole.OWNER,
      );

      return community;
    } catch (error) {
      throw new Error(`Failed to create community: ${error.message}`);
    }
  }
  private async createCommunityMember(
    userId: string,
    communityId: string,
    role: MemberRole,
    joinedAt: Date = new Date(),
  ): Promise<CommunityMembersDocument> {
    return this.communityMembersModel.create({
      user: userId,
      community: communityId,
      role,
      joinedAt,
    });
  }
}
