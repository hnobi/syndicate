import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MemberRole } from 'src/common/enums/community-user.enum';

@Schema({ timestamps: true })
export class CommunityMembers extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Community', required: true })
  community: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ enum: MemberRole, default: MemberRole.MEMBER })
  role: MemberRole;

  @Prop({ type: Object })
  joinedAt: Date;
}

export const CommunityMembersSchema =
  SchemaFactory.createForClass(CommunityMembers);
export type CommunityMembersDocument = CommunityMembers & Document;
