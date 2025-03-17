import { NotFoundException } from "@nestjs/common";
import { Wallet } from "src/modules/wallet/wallet.entity";
import { Repository } from "typeorm";
import { EVMWalletService } from "./impl/EVMWalletService";

export class WalletServiceFactory {
    constructor(
        readonly walletRepo: Repository<Wallet>
    ) { }

    getWalletService(chain: string) {
        switch (chain) {
            case "berachain":
            case "ancient8":
            case "metis":
            case "arbitrum":
            case "zksync":
                return new EVMWalletService(chain, this.walletRepo);
            default: {
                throw new NotFoundException("Chain is not supported")
            }
        }
    }
}