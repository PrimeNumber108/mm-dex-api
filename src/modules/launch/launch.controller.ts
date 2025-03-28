import { Body, Controller, Get, Post, Put, Query } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Launch } from "./launch.entity";
import { Repository } from "typeorm";
import { WalletServiceFactory } from "src/libs/services/wallet/WalletServiceFactory";
import { ApiResponse, ApiSecurity, ApiTags, ApiQuery } from "@nestjs/swagger";
import { Roles } from "src/decorators/roles.decorator";
import { UserRole } from "../user/user.entity";
import { CryptoHelper } from "src/libs/utils/crypto-helper";
import { ImportLaunchDto } from "./dtos/upsert-launch.dto";

import {CryptoFEHelper} from "../utils/crypto"
import { env } from 'src/config';


@ApiTags('Launch')
@ApiSecurity('x-api-secret') // Ensure Swagger includes x-api-secret
@ApiSecurity('username') // Ensure Swagger includes username
@Controller('Launch')
export class LaunchController {
    // private readonly factory: WalletServiceFactory;
    constructor(
        @InjectRepository(Launch)
        walletRepo: Repository<Launch>
    ) {
        // this.factory = new WalletServiceFactory(walletRepo);
    }

    @Get('/distribute')
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'address', required: false, type: String, example: '0x123...' })
    @ApiResponse({ status: 200, type: [Launch], description: 'List of wallets with pagination and filtering' })


    @Post('/import-wallet')
    @Roles(UserRole.ADMIN)
    @ApiResponse({
        status: 201,
        type: String,
        description: 'Encrypted wallet'
    })
    async importWallet(@Body() { privateKey, chain, cluster, symbol, type }: ImportLaunchDto): Promise<string> {
        // const keyPair = await CryptoFEHelper.generateKeypair()
        // console.log("X25519 Public Key:", keyPair.publicKey)
        // console.log("X25519 Private Key:", keyPair.privateKey)
        const params  = {
            privateKey,
            chain,
            cluster,
            symbol,
            type
        }

        const encryptedPrivateKey = await CryptoFEHelper.encryptMessage(privateKey, env.keys.publicKey);
        params.privateKey = encryptedPrivateKey
       
        // const service = this.factory.getWalletService(params.chain);
        // const response = await service.importWallet(params);
        return "";
    }


   
}