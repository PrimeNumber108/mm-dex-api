import { ApiResponseProperty, OmitType } from "@nestjs/swagger";
import { BaseResponse } from "src/utils/base/base-response";

export class WalletPrivateResponseDto extends BaseResponse {
    @ApiResponseProperty({ type: String })
    address: string;

    privateKey: string;

    @ApiResponseProperty({ type: String })
    chain: string;

    @ApiResponseProperty({ type: String })
    cluster: string;

    @ApiResponseProperty({ type: Number })
    index: number;
}

export class WalletResponseDto extends OmitType(WalletPrivateResponseDto, ['privateKey']) { }

export class ClusterResponseDto {
    @ApiResponseProperty({ type: String })
    cluster: string;

    @ApiResponseProperty({ type: [WalletResponseDto] })
    wallets: WalletResponseDto[];
}

export class ClusterPrivateResponseDto {
    @ApiResponseProperty({ type: String })
    cluster: string;

    @ApiResponseProperty({ type: [WalletPrivateResponseDto] })
    wallets: WalletPrivateResponseDto[];
}