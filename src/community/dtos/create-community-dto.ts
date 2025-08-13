import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Visibility } from 'src/common/enums/visibility-enum';

export class CreateCommunityDto {
  @IsString()
  name: string;

  @IsString()
  description?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsEnum(Visibility)
  @IsOptional()
  visibility?: Visibility;
}
