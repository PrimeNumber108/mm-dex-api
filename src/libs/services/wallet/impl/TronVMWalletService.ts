import { Repository } from "typeorm";
import { BaseWalletService } from "./BaseWalletService";
import { Wallet } from "src/modules/wallet/wallet.entity";
import { GenerateClusterDto, GenerateWalletDto, ImportClusterDto, ImportWalletDto } from "src/modules/wallet/dtos/upsert-wallet.dto";
import { WalletPrivateResponseDto } from "src/modules/wallet/dtos/wallet.dto";
import { TronWeb } from "tronweb";

export class TronVMWalletService extends BaseWalletService {
    constructor(
        chain: string,
        walletRepo: Repository<Wallet>
    ) {
        super(chain, walletRepo);
    }

    async generateCluster(params: GenerateClusterDto): Promise<WalletPrivateResponseDto[]> {
        const records = [];
        for (let i = 0; i < params.numOfKeys; i++) {
            const wallet = TronWeb.createRandom(`${Date.now()}`);
            records.push(this.walletRepo.create({
                address: wallet.address,
                privateKey: wallet.privateKey,
                cluster: params.cluster,
                index: i,
                chains: [params.chain]
            }))
        }
        return await this.walletRepo.save(records);
    }
    async importCluster(params: ImportClusterDto): Promise<WalletPrivateResponseDto[]> {
        const records = [];
        for (let i = 0; i < params.privateKeys.length; i++) {
            const privateKey = params.privateKeys[i]
            const address = TronWeb.address.fromPrivateKey(params.privateKeys[i]) as string;
            records.push(this.walletRepo.create({
                address,
                privateKey,
                cluster: params.cluster,
                index: i,
                chains: [params.chain]
            }))
        }
        return await this.walletRepo.save(records);
    }
    async importWallet(params: ImportWalletDto): Promise<WalletPrivateResponseDto> {
        const address = TronWeb.address.fromPrivateKey(params.privateKey) as string;
        let index = 0;
        if (params.cluster) {
            const cluster = await this.getCluster({ cluster: params.cluster });
            index = cluster.length;
        }
        const record = this.walletRepo.create({
            address: address,
            privateKey: params.privateKey,
            cluster: params.cluster,
            chains: [params.chain],
            index
        })
        return await this.walletRepo.save(record);
    }

    async getWallets(page: number, pageSize: number, address?: string): Promise<{ total: number; data: Wallet[]  }> {
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
    
    async generateWallet(params: GenerateWalletDto): Promise<WalletPrivateResponseDto> {
        const wallet = TronWeb.createRandom(`${Date.now()}`);
        let index = 0;
        if (params.cluster) {
            const cluster = await this.getCluster({ cluster: params.cluster });
            index = cluster.length;
        }
        const record = this.walletRepo.create({
            address: wallet.address,
            privateKey: wallet.privateKey,
            cluster: params.cluster,
            chains: [params.chain],
            index
        })

        return await this.walletRepo.save(record);
    }
}