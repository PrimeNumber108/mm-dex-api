import { Repository } from "typeorm";
import { BaseWalletService } from "./BaseWalletService";
import { Wallet } from "src/modules/wallet/wallet.entity";
import { GenerateClusterDto, GenerateWalletDto, ImportClusterDto, ImportWalletDto } from "src/modules/wallet/dtos/upsert-wallet.dto";
import { WalletPrivateResponseDto } from "src/modules/wallet/dtos/wallet.dto";
import { ethers } from "ethers";
import {ExecutorSDK} from 'src/utils/crypto'

export class EVMWalletService extends BaseWalletService {
    constructor(
        chain: string,
        walletRepo: Repository<Wallet>
    ) {
        super(chain, walletRepo);
    }

    async generateCluster(params: GenerateClusterDto): Promise<WalletPrivateResponseDto[]> {
        const records = [];
        for (let i = 0; i < params.numOfKeys; i++) {
            const wallet = ethers.Wallet.createRandom();
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
            const wallet = new ethers.Wallet(params.privateKeys[i]);
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
    async importWallet(params: ImportWalletDto): Promise<WalletPrivateResponseDto> {
        const wallet = new ethers.Wallet(params.privateKey);
        let index = 0;
        if (params.cluster) {
            const cluster = await this.getCluster({ cluster: params.cluster });
            index = cluster.length;
        }

        const raw = {
            privateKey: params.privateKey,
            cluster: 'zksync-tresury-keys',
            chain: 'zksync'
        };
    
        const encrypedKey = ExecutorSDK.encryptPayload(raw);
        console.log('encrypedKey:: ',encrypedKey)
        const record = this.walletRepo.create({
            address: wallet.address,
            privateKey: encrypedKey, //wallet.privateKey
            cluster: params.cluster,
            chains: [params.chain],
            index
        })
        
        return await this.walletRepo.save(record);
    }
    async generateWallet(params: GenerateWalletDto): Promise<WalletPrivateResponseDto> {
        const wallet = ethers.Wallet.createRandom();
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