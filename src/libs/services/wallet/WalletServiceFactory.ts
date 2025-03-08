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
            case "a8":
            case "metis":
                return new EVMWalletService(chain, this.walletRepo);
            default: {
                throw new NotFoundException("Chain is not supported")
            }
        }
    }
}