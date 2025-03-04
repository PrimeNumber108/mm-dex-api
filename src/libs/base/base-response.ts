import { ApiResponseProperty } from '@nestjs/swagger';

export class BaseResponse {
  @ApiResponseProperty({ type: Number })
  id: number;

  @ApiResponseProperty({ type: Number })
  created_at: number;

  @ApiResponseProperty({ type: Number })
  updated_at: number;
}

export class BaseResponseWithoutId {
  @ApiResponseProperty({ type: Number })
  created_at: number;

  @ApiResponseProperty({ type: Number })
  updated_at: number;
}

export class BasePaginationResponse {
  @ApiResponseProperty({ type: Number })
  total: number;

  @ApiResponseProperty({ type: Number })
  page: number;

  @ApiResponseProperty({ type: Number })
  pageSize: number;
}
