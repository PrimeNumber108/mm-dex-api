import { ApiResponseProperty, OmitType } from "@nestjs/swagger";
import { BaseResponse } from "src/utils/base/base-response";
import { UserRole } from "../user.entity";

export class UserDto extends BaseResponse{
    @ApiResponseProperty({ type: String })
    username: string;

    apiSecret: string;

    @ApiResponseProperty({ enum: UserRole })
    userRole: UserRole;
}

export class UserResponseDto extends OmitType(UserDto, ['apiSecret']) {}