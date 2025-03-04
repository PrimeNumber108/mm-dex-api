import { ApiResponseProperty, OmitType } from "@nestjs/swagger";
import { BaseResponse } from "src/libs/base/base-response";
import { UserRole } from "../user.entity";

export class UserDto extends BaseResponse{
    @ApiResponseProperty({ type: String })
    username: string;

    @ApiResponseProperty({ type: String })
    apiSecret: string;

    @ApiResponseProperty({ enum: UserRole })
    role: UserRole;
}