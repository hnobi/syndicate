import { Community } from 'src/community/schemas/community.schema';

export interface CommunitiesResponse {
  communities: Community[];
  pagination: {
    page: number;
    totalPages: number;
    hasNext: boolean;
    limit: number;
  };
}
