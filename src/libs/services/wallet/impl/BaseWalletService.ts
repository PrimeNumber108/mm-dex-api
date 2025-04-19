import { QueryClusterDto, QueryWalletDto, QueryWalletsDto } from "src/modules/wallet/dtos/query-wallet.dto";
import { GenerateClusterDto, ImportClusterDto, ImportWalletDto, GenerateWalletDto, RenameClusterDto, SupportChainsDto } from "src/modules/wallet/dtos/upsert-wallet.dto";
import { WalletPrivateResponseDto, WalletResponseDto } from "src/modules/wallet/dtos/wallet.dto";
import { IWalletService } from "../IWalletService";
import { Repository } from "typeorm";
import { Wallet } from "src/modules/wallet/wallet.entity";
import { BadRequestException, NotFoundException } from "@nestjs/common";

export abstract class BaseWalletService implements IWalletService {
    constructor(
        readonly chain: string,
        protected readonly walletRepo: Repository<Wallet>
    ) { }

    async getClusterAddresses(params: QueryClusterDto): Promise<string[]> {
        const wallets = await this.getCluster(params);
        return wallets.map(w => w.address);
    }
    async supportChains(params: SupportChainsDto): Promise<WalletResponseDto[]> {
        const records = await this.walletRepo.findBy({cluster: params.cluster});
        const updatedRecords = records.map((r) => {
            const chains = Array.from(new Set([...r.chains, ...params.chains]));

            return {
                ...r,
                chains
            }
        })

        const updatedWallets = await this.walletRepo.save(updatedRecords);
        return updatedWallets.map(w => {
            const {privateKey, ...rest} = w;
            return {...rest};
        }) 
    }
    async poll(): Promise<WalletResponseDto[]> {
        const wallets = await this.walletRepo.find({});
        return wallets.map(w => {
            const {privateKey, ...rest} = w;
            return {...rest};
        })
    }
    async renameCluster(params: RenameClusterDto): Promise<boolean> {
        return (await this.walletRepo.update({
            cluster: params.cluster
        }, {
            cluster: params.newName
        })).affected > 0;
    }

    async listAllClusters(): Promise<string[]> {
        const clusters = await this.walletRepo.createQueryBuilder("wallet")
            .select("DISTINCT wallet.cluster", "cluster")
            .getRawMany();

        return clusters.map(c => c.cluster);
    }

    static hidePrivateInfo(wallet: Wallet): WalletResponseDto {
        const {
            privateKey, ...rest
        } = wallet;
        return rest
    }

    async getCluster(params: QueryClusterDto): Promise<WalletResponseDto[]> {
        const queryBuilder = this.walletRepo.createQueryBuilder("wallet")
            .where("wallet.cluster = :cluster", { cluster: params.cluster });

        if (params.fromIndex) {
            queryBuilder.andWhere("wallet.index >= :fromIndex", { fromIndex: params.fromIndex });
        }
        if (params.toIndex) {
            queryBuilder.andWhere("wallet.index < :toIndex", { toIndex: params.toIndex });
        }

        queryBuilder.orderBy("wallet.index", "ASC");

        return (await queryBuilder.getMany()).map(BaseWalletService.hidePrivateInfo); // Ensures correct entity mapping
    }

    async assertWalletForExecution(params: QueryWalletDto): Promise<WalletPrivateResponseDto> {
        const wallet = await this.walletRepo.findOneBy(params);
        if (!wallet) throw new NotFoundException("Wallet not found");
        return wallet;
    }
    async assertWalletsForExecution(params: QueryWalletsDto): Promise<WalletPrivateResponseDto[]> {
        const queryBuilder = this.walletRepo.createQueryBuilder("wallet")
        if (params.accounts) {
            return await queryBuilder
                .where("wallet.address IN (:...accounts)", { accounts: params.accounts })
                .getMany()
        }
        if (!params.cluster) {
            throw new BadRequestException("Must provide cluster or accounts");
        }
        queryBuilder.where("wallet.cluster = :cluster", { cluster: params.cluster });

        if (params.fromIndex) {
            queryBuilder.andWhere("wallet.index >= :fromIndex", { fromIndex: params.fromIndex });
        }
        if (params.toIndex) {
            queryBuilder.andWhere("wallet.index < :toIndex", { toIndex: params.toIndex });
        }

        queryBuilder.orderBy("wallet.index", "ASC");
        return await queryBuilder.getMany();
    }
    async assertKnownAccount(params: QueryWalletDto): Promise<string> {
        return (await this.assertWalletForExecution(params)).address;
    }
    async assertKnownAccounts(params: QueryWalletsDto): Promise<string[]> {
        return (await this.assertWalletsForExecution(params)).map(w => w.address);
    }
    generateCluster(params: GenerateClusterDto): Promise<WalletPrivateResponseDto[]> {
        throw new Error("Method not implemented.");
    }
    importCluster(params: ImportClusterDto): Promise<WalletPrivateResponseDto[]> {
        throw new Error("Method not implemented.");
    }
    importWallet(params: ImportWalletDto): Promise<WalletPrivateResponseDto> {
        throw new Error("Method not implemented.");
    }
    generateWallet(params: GenerateWalletDto): Promise<WalletPrivateResponseDto> {
        throw new Error("Method not implemented.");
    }

    async getWalletByAddress(address: string): Promise<Wallet> {
        console.log('address:: ',address)
        const wallet = await this.walletRepo.findOne({ where: { address } });
        if (!wallet) {
            throw new NotFoundException(`Wallet with address ${address} not found`);
        }
        return wallet;
    }

    async getWallets(page: number, pageSize: number, address?: string): Promise<{ total: number; data: Wallet[] }> {
        const query = this.walletRepo.createQueryBuilder('wallet');

        // Apply filtering if address is provided
        if (address) {
            query.where('wallet.address = :address', { address });
        }

        // Get total count for pagination
        const total = await query.getCount();

        // Apply pagination
        const wallets = await query
            .orderBy('wallet.index', 'ASC')
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .getMany();

        return { total, data: wallets };
    }
}