import { getAddress, Wallet } from "ethers";
import { A8_ADDRESS, NATIVE, PROVIDER } from "src/libs/utils/constants";
import { Token } from "src/libs/module/token";
import { getRandomInt, sleep } from "src/libs/utils/time";
import { DojoSwap } from "./swap";
import tokensForTrade from "./tokens-for-mix-trade.json";
import { env } from "src/config";

export namespace DojoMixTrade {
    export async function mixSwapOneWalletETH(privKey: string, baseTokens: string[], rounds: number) {
        const wallet = new Wallet(privKey, PROVIDER);
        for (let i = 0; i < rounds; i++) {
            const tokenIdx = getRandomInt(0, baseTokens.length);
            const baseToken = baseTokens[tokenIdx];
            console.log(`Mix swap for wallet: ${wallet.address}, round: ${i}, chosen token: ${baseToken}...`);
            let attempts = 0;
            let success = false;
            do {
                try {

                    const quoteBalance = await Token.getTokenBalance(wallet.address, NATIVE);
                    const buyAmountPercent = getRandomInt(5, 7);
                    const buyAmount = quoteBalance * BigInt(buyAmountPercent) / 1000n;

                    console.log(`Buying with ${buyAmount}.....`);
                    const buyHash = await DojoSwap.buyTokenWithETH(wallet, baseToken, buyAmount);
                    console.log(`Buy tx hash: ` + buyHash);
                    await sleep(getRandomInt(5000, 7000));


                    const baseBalance = await Token.getTokenBalance(wallet.address, baseToken);
                    console.log(`Selling all....`)
                    const sellHash = await DojoSwap.sellTokenToETH(wallet, baseToken, baseBalance * 995n / 1000n);
                    console.log(`Sell tx hash: ` + sellHash);
                    success = true;
                } catch (err) {
                    console.log(err);
                }

                await sleep(getRandomInt(2000, 3000));
            } while (attempts < 3 && !success);
        }
    }

    export async function mixSwapOneWallet(privKey: string, baseTokens: string[], rounds: number) {
        const wallet = new Wallet(privKey, PROVIDER);
        for (let i = 0; i < rounds; i++) {
            const tokenIdx = getRandomInt(0, baseTokens.length);
            const baseToken = baseTokens[tokenIdx];
            console.log(`Mix swap for wallet: ${wallet.address}, round: ${i}, chosen token: ${baseToken}...`);
            let attempts = 0;
            let success = false;
            do {
                try {

                    const quoteBalance = await Token.getTokenBalance(wallet.address, A8_ADDRESS);
                    const buyAmountPercent = getRandomInt(5, 7);
                    const buyAmount = quoteBalance * BigInt(buyAmountPercent) / 1000n;

                    console.log(`Buying with ${buyAmount}.....`);
                    const buyHash = await DojoSwap.buyTokenWithA8(wallet, baseToken, buyAmount);
                    console.log(`Buy tx hash: ` + buyHash);
                    await sleep(getRandomInt(5000, 7000));


                    const baseBalance = await Token.getTokenBalance(wallet.address, baseToken);
                    console.log(`Selling all....`)
                    const sellHash = await DojoSwap.sellTokenToA8(wallet, baseToken, baseBalance * 995n / 1000n);
                    console.log(`Sell tx hash: ` + sellHash);
                    success = true;
                } catch (err) {
                    console.log(err);
                }

                await sleep(getRandomInt(2000, 3000));
            } while (attempts < 3 && !success);
        }
    }

    export async function mixSwapMultiWallets(
        privKeys: string[],
        quoteToken: string,
        rounds: number
    ) {
        const baseTokens = (env.network === 'mainnet' ? tokensForTrade.mainnet : tokensForTrade.testnet)
            .map(t => getAddress(t))
        await Promise.all(privKeys.map(pk =>
            quoteToken === A8_ADDRESS ?
                mixSwapOneWallet(pk, baseTokens, rounds)
                : mixSwapOneWalletETH(pk, baseTokens, rounds)))
    }
}