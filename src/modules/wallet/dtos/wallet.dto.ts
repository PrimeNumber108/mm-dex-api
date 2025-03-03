import { ApiResponseProperty, OmitType } from "@nestjs/swagger";
import { BaseResponse } from "src/libs/base/base-response";

export class WalletPrivateResponseDto extends BaseResponse {
    @ApiResponseProperty({ type: String })
    address: string;

    privateKey: string;

    @ApiResponseProperty({ type: String })
    cluster: string;

    @ApiResponseProperty({ type: Number })
    index: number;
}

export class WalletResponseDto extends OmitType(WalletPrivateResponseDto, ['privateKey']) { }