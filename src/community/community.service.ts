import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Community, CommunityDocument } from './schemas/community.schema';
import { Model } from 'mongoose';
import { CreateCommunityDto } from './dtos/create-community-dto';
import {
  CommunityMembers,
  CommunityMembersDocument,
} from './schemas/community-members.schema';
import { MemberRole } from 'src/common/enums/community-user.enum';
import { Visibility } from 'src/common/enums/visibility-enum';
import { CommunitiesResponse } from 'src/common/interfaces/community-interfaces';

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
        throw new BadRequestException('Community creation failed');
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
  async getCommunities(
    visibility: Visibility,
    page = 1,
    limit = 20,
  ): Promise<CommunitiesResponse> {
    const skip = (page - 1) * limit;

    const query = { visibility };

    const communities = await this.communityModel
      .find(query)
      // .populate('ownerId', 'name avatarUrl')
      .sort({ memberCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await this.communityModel.countDocuments(query);

    return {
      communities,
      pagination: {
        page,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + communities.length < total,
        limit,
      },
    };
  }

  async getCommunityBySlug(slug: string): Promise<Community | null> {
    const community = await this.communityModel
      .findOne({ slug })
      .populate('ownerId', 'name avatarUrl');

    if (!community) {
      throw new NotFoundException('Community not found');
    }
    return community;
  }

  async updateCommunity(
    slug: string,
    updateData: Partial<CreateCommunityDto>,
    userId: string,
  ): Promise<Community | null> {
    const community = await this.communityModel.findOne({ slug });
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    if (community.ownerId.toString() !== userId) {
      throw new BadRequestException(
        'You are not authorized to edit this community',
      );
    }

    const newCommunity = await this.communityModel
      .findOneAndUpdate(
        { slug },
        {
          $set: {
            ...updateData,
            updatedAt: new Date(),
          },
        },
        { new: true, runValidators: true },
      )
      .populate('ownerId', 'name avatarUrl');

    return newCommunity;
  }

}
