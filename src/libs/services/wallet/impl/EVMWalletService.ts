import { Repository } from "typeorm";
import { BaseWalletService } from "./BaseWalletService";
import { Wallet, typeWallet} from "src/modules/wallet/wallet.entity";
import { GenerateClusterDto, GenerateWalletDto, ImportClusterDto, ImportWalletDto } from "src/modules/wallet/dtos/upsert-wallet.dto";
import { WalletPrivateResponseDto } from "src/modules/wallet/dtos/wallet.dto";
import { ethers } from "ethers";
import {CryptoHelper} from 'src/libs/utils/crypto-helper'

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
            const encryptedPrivateKey = CryptoHelper.encrypt(wallet.privateKey);

            records.push(this.walletRepo.create({
                address: wallet.address,
                privateKey: encryptedPrivateKey,
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
            const encryptedPrivateKey = CryptoHelper.encrypt(wallet.privateKey);

            records.push(this.walletRepo.create({
                address: wallet.address,
                privateKey: encryptedPrivateKey,
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

        const encryptedPrivateKey = CryptoHelper.encrypt(wallet.privateKey);


        const record = this.walletRepo.create({
            address: wallet.address,
            privateKey: encryptedPrivateKey, //wallet.privateKey
            cluster: params.cluster,
            chains: [params.chain],
            type: typeWallet[params.type as keyof typeof typeWallet],
            accoundId: params.chain+params.symbol+params.type+params.chain.length,
            symbol: params.symbol,
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

        const encryptedPrivateKey = CryptoHelper.encrypt(wallet.privateKey);

        const record = this.walletRepo.create({
            address: wallet.address,
            privateKey: encryptedPrivateKey,
            cluster: params.cluster,
            chains: [params.chain],
            index
        })

        return await this.walletRepo.save(record);
    }
}