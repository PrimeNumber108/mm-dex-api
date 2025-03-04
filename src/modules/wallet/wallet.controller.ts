import { Body, Controller, Get, Post, Put, Query } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Wallet } from "./wallet.entity";
import { Repository } from "typeorm";
import { WalletServiceFactory } from "src/libs/services/wallet/WalletServiceFactory";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorators/roles.decorator";
import { UserRole } from "../user/user.entity";
import { EncryptedDto, GenerateClusterDto, GenerateWalletDto, ImportClusterDto, ImportWalletDto, RenameClusterDto } from "./dtos/upsert-wallet.dto";
import { CryptoHelper } from "src/libs/utils/crypto-helper";
import { WalletResponseDto } from "./dtos/wallet.dto";
import { QueryClusterDto, QueryWalletDto, QueryWalletsDto } from "./dtos/query-wallet.dto";

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
    private readonly factory: WalletServiceFactory;
    constructor(
        @InjectRepository(Wallet)
        walletRepo: Repository<Wallet>
    ) {
        this.factory = new WalletServiceFactory(walletRepo);
    }

    @Post('/import-wallet')
    @Roles(UserRole.ADMIN)
    @ApiResponse({
        status: 201,
        type: String,
        description: 'Encrypted wallet'
    })
    async importWallet(@Body() { payload }: EncryptedDto): Promise<string> {
        const params: ImportWalletDto = JSON.parse(CryptoHelper.decrypt(payload));
        const service = this.factory.getWalletService(params.chain);
        const response = await service.importWallet(params);
        return CryptoHelper.encrypt(JSON.stringify(response));
    }

    @Post('/import-cluster')
    @Roles(UserRole.ADMIN)
    @ApiResponse({
        status: 201,
        type: String,
        description: 'Encrypted cluster'
    })
    async importCluster(
        @Body() { payload }: EncryptedDto
    ): Promise<string> {

        const params: ImportClusterDto = JSON.parse(CryptoHelper.decrypt(payload));
        const service = this.factory.getWalletService(params.chain);
        const response = await service.importCluster(params);
        return CryptoHelper.encrypt(JSON.stringify(response));
    }

    @Post('/generate-wallet')
    @Roles(UserRole.ADMIN)
    @ApiResponse({
        status: 201,
        type: String,
        description: 'Encrypted wallet'
    })
    async generateWallet(
        @Body() { payload }: EncryptedDto
    ): Promise<string> {
        const params: GenerateWalletDto = JSON.parse(CryptoHelper.decrypt(payload));
        const service = this.factory.getWalletService(params.chain);
        const response = await service.generateWallet(params);
        return CryptoHelper.encrypt(JSON.stringify(response));
    }

    @Post('/generate-cluster')
    @Roles(UserRole.ADMIN)
    @ApiResponse({
        status: 201,
        type: String,
        description: 'Encrypted cluster'
    })
    async generateCluster(
        @Body() { payload }: EncryptedDto
    ): Promise<string> {
        const params: GenerateClusterDto = JSON.parse(CryptoHelper.decrypt(payload));
        const service = this.factory.getWalletService(params.chain);
        const response = await service.generateCluster(params);
        return CryptoHelper.encrypt(JSON.stringify(response));
    }

    @Put('/rename-cluster')
    @Roles(UserRole.ADMIN)
    @ApiResponse({
        status: 201,
        type: Boolean,
        description: 'Renamed successfully'
    })
    async renameCluster(
        @Body() params: RenameClusterDto
    ): Promise<boolean> {
        const service = this.factory.getWalletService("berachain");
        return await service.renameCluster(params);
    }

    @Get('/cluster')
    @ApiResponse({
        status: 200,
        type: [WalletResponseDto],
        description: 'Cluster'
    })
    async getCluster(@Query() params: QueryClusterDto): Promise<WalletResponseDto[]> {
        const service = this.factory.getWalletService("berachain");
        return await service.getCluster(params);
    }

    @Get('/list-clusters')
    @ApiResponse({
        status: 200,
        type: [String],
        description: 'All cluster names'
    })
    async listAllClusters(): Promise<string[]> {
        const service = this.factory.getWalletService("berachain");
        return await service.listAllClusters();
    }

    @Get('/export-wallet')
    @Roles(UserRole.ADMIN)
    @ApiResponse({
        status: 200,
        type: String,
        description: 'Encrypted wallet'
    })
    async exportWallet(@Query() params: QueryWalletDto): Promise<string> {
        const service = this.factory.getWalletService("berachain");
        const response = await service.assertWalletForExecution(params);
        return CryptoHelper.encrypt(JSON.stringify(response));
    }

    @Get('/export-wallets')
    @Roles(UserRole.ADMIN)
    @ApiResponse({
        status: 200,
        type: String,
        description: 'Encrypted wallets'
    })
    async exportWallets(@Query() params: QueryWalletsDto): Promise<string> {
        const service = this.factory.getWalletService("berachain");
        const response = await service.assertWalletsForExecution(params);
        return CryptoHelper.encrypt(JSON.stringify(response));
    }

}