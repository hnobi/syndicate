import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from 'src/common/enums/user-role.enum';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  avatarUrl?: string;

  @Prop({ enum: Role, default: Role.MEMBER })
  role: Role;

  //   @Prop({ type: [{ type: Types.ObjectId, ref: 'CommunityMember' }] })
  //   memberships: Types.ObjectId[];

  //   @Prop({ type: [{ type: Types.ObjectId, ref: 'Post' }] })
  //   posts: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = User & Document;
