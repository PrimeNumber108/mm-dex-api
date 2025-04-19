import { Repository } from "typeorm";
import { BaseWalletService } from "./BaseWalletService";
import { Wallet, typeWallet} from "src/modules/wallet/wallet.entity";
import { GenerateClusterDto, GenerateWalletDto, ImportClusterDto, ImportWalletDto } from "src/modules/wallet/dtos/upsert-wallet.dto";
import { WalletPrivateResponseDto } from "src/modules/wallet/dtos/wallet.dto";
import { ethers } from "ethers";
import {CryptoFEHelper} from "src/modules/utils/crypto"
import { env } from 'src/config';
import { NotFoundException } from "@nestjs/common";

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
            // const encryptedPrivateKey = CryptoHelper.encrypt(wallet.privateKey);

            records.push(this.walletRepo.create({
                address: wallet.address,
                privateKey: wallet.privateKey,
                cluster: params.cluster,
                index: i,
                accoundId: params.chain+"_"+i+"_"+wallet.address.slice(-2),
                chains: [params.chain]
            }))
        }
        return await this.walletRepo.save(records);
    }
    async importCluster(params: ImportClusterDto): Promise<WalletPrivateResponseDto[]> {
        const records = [];
        for (let i = 0; i < params.privateKeys.length; i++) {
            const wallet = new ethers.Wallet(params.privateKeys[i]);
            // const encryptedPrivateKey = CryptoHelper.encrypt(wallet.privateKey);

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
        const encryptedKey = params.privateKey
        const decryptedKey = await CryptoFEHelper.decryptMessage(encryptedKey, env.keys.privateKey, env.keys.publicKey);

        const wallet = new ethers.Wallet(decryptedKey);
        let index = 0;
        if (params.cluster) {
            const cluster = await this.getCluster({ cluster: params.cluster });
            index = cluster.length;
        }

        // const encryptedPrivateKey = CryptoHelper.encrypt(wallet.privateKey);


        const record = this.walletRepo.create({
            address: wallet.address,
            privateKey: wallet.privateKey, //wallet.privateKey
            cluster: params.cluster,
            chains: [params.chain],
            type: typeWallet[params.type as keyof typeof typeWallet],
            accoundId: params.chain+"_"+params.symbol+"_"+params.type+"_"+index+"_"+wallet.address.slice(-2),
            symbol: params.symbol,
            index
        })
        //lasted_index + index_symbol

        return await this.walletRepo.save(record);
    }

    // async getWalletByAddress(address: string): Promise<Wallet> {
    //     const wallet = await this.walletRepo.findOne({ where: { address } });
    //     if (!wallet) {
    //         throw new NotFoundException(`Wallet with address ${address} not found`);
    //     }
    //     return wallet;
    // }

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
        const wallet = ethers.Wallet.createRandom();
        let index = 0;
        if (params.cluster) {
            const cluster = await this.getCluster({ cluster: params.cluster });
            index = cluster.length;
        }

        // const encryptedPrivateKey = CryptoHelper.encrypt(wallet.privateKey);

        const record = this.walletRepo.create({
            address: wallet.address,
            privateKey: wallet.privateKey,
            cluster: params.cluster,
            chains: [params.chain],
            type: typeWallet[params.type as keyof typeof typeWallet],
            accoundId: params.chain+"_"+params.symbol+"_"+params.type+"_"+index+"_"+wallet.address.slice(-2),
            symbol: params.symbol,
            index
        })

        return await this.walletRepo.save(record);
    }
}