import { NotFoundException } from "@nestjs/common";
import { Wallet } from "src/modules/wallet/wallet.entity";
import { Repository } from "typeorm";
import { EVMWalletService } from "./impl/EVMWalletService";
import { TronVMWalletService } from "./impl/TronVMWalletService";


export class WalletServiceFactory {
    constructor(
        readonly walletRepo: Repository<Wallet>
    ) { }


    getWalletService(chain: string) {
        switch (chain) {
            case "berachain":
                return new EVMWalletService(chain, this.walletRepo);
            case "ancient8":
                return new EVMWalletService(chain, this.walletRepo);
            case "metis":
            case "arbitrum":
            case "zksync":
                return new EVMWalletService(chain, this.walletRepo);
            case "tron":
                return new TronVMWalletService(chain, this.walletRepo);
            default: {
                throw new NotFoundException("Chain is not supported")
            }
        }
    }
}