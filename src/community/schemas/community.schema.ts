import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Visibility } from 'src/common/enums/visibility-enum';

@Schema({ timestamps: true })
export class Community extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description: string;

  @Prop()
  avatar: string;

  @Prop()
  coverImage: string;

  @Prop({ enum: Visibility, default: Visibility.PUBLIC })
  visibility: Visibility;

  @Prop({ default: 0 })
  memberCount: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;
}

export const CommunitySchema = SchemaFactory.createForClass(Community);
export type CommunityDocument = Community & Document;
