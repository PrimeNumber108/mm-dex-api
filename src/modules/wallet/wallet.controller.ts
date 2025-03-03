import { Body, Controller, Injectable, Post } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Wallet } from "./wallet.entity";
import { Repository } from "typeorm";
import { WalletServiceFactory } from "src/libs/services/wallet/WalletServiceFactory";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorators/roles.decorator";
import { UserRole } from "../user/user.entity";
import { DecodeBody } from "src/decorators/decode-body.decorator";
import { ImportWalletDto } from "./dtos/upsert-wallet.dto";
import { HeaderPayload, HeaderPayloadType } from "src/decorators/header-payload.decorator";
import { CryptoHelper } from "src/libs/utils/crypto-helper";

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
    private readonly factory: WalletServiceFactory;
    constructor(
        @InjectRepository(Wallet)
        private readonly walletRepo: Repository<Wallet>
    ) {
        this.factory = new WalletServiceFactory(walletRepo);
    }

    @Post('/import-wallet')
    @Roles(UserRole.ADMIN)
    @DecodeBody()
    @ApiResponse({
        status: 201,
        type: String,
        description: 'Encrypted wallet'
    })
    async importWallet(@HeaderPayload() header: HeaderPayloadType, @Body() params: ImportWalletDto): Promise<string> {
        const service = this.factory.getWalletService(header.chain);
        const response = await service.importWallet(params);
        return CryptoHelper.encrypt(JSON.stringify(response));
    }
}