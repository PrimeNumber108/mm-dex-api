import { ethers, Wallet } from "ethers";
import { sleep } from "src/libs/utils/time";
import { A8_FACTORY, PROVIDER } from "src/libs/utils/constants";
import { DojoSwap } from "./swap";

export namespace DojoSniper {

    export class Sniper {
        private latestBlock: number
        private nonces: number[];
        constructor(
            private readonly wallets: Wallet[],
            private readonly amounts: bigint[],
        ) { 
            
        }

        async precalculateNonces() {
            this.nonces = await Promise.all(
                this.wallets.map(async (wallet) => {
                    return await wallet.getNonce("pending");
                })
            )
        }

        private async buyForWallet(walletIdx: number, token: string) {
            let attempt = 0;
            let success = false;
            const wallet = this.wallets[walletIdx];
            const nonce = this.nonces[walletIdx];
            const amount = this.amounts[walletIdx];
            do {
                try {
                    const hash = await DojoSwap.fastbuyTokenWithA8(
                        wallet,
                        nonce,
                        token,
                        amount
                    )
                    console.log(hash)
                    success = true;
                } catch (err) {
                    const msg = (err as Error).message;
                    if (msg.includes('nonce has already been used')) {
                        success = true;
                    } else {
                        console.log(`Failed to snipe for wallet ${wallet.address} at attempt ${attempt + 1}`);
                        console.log(err);
                    }
                }
            } while (attempt < 10 && !success);
        }
        async batchBuy(token: string) {
            await Promise.all(
                this.wallets.map(async (w, i) => {
                    return await this.buyForWallet(i, token)
                })
            )
        }

        async run(token: string, fromBlock?: number) {
            console.log(this.nonces);

            this.latestBlock = fromBlock ?? (await PROVIDER.getBlock('latest'))!.number;

            while (true) {
                try {
                    const logs = await PROVIDER.getLogs({
                        fromBlock: this.latestBlock,
                        topics: [
                            ethers.id("List(address,uint256,uint256,address,address)"),
                            ethers.zeroPadValue(A8_FACTORY, 32)
                        ]
                    })

                    console.log(logs);
                    if (logs.length > 0) {
                        console.log(`Detected new pool. Sniping.....`)
                        this.batchBuy(token);

                        return;
                    }

                    const latest = await PROVIDER.getBlock('latest');
                    if (latest) this.latestBlock = latest.number;

                } catch (err) {
                    console.log(err);
                }

                await sleep(100);
            }
        }
    }
}