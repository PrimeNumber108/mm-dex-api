import { Wallet } from "ethers";
import { KodiakRouter02__factory, UniswapV2Router__factory } from "src/contracts";
import { EVMTokenHelper } from "src/libs/evm/token-helper";
import { BerachainConsts } from "./consts";

export namespace KodiakSwapper {
    export async function executeSwap(
        wallet: Wallet,
        tokenIn: string,
        tokenOut: string,
        amountIn: bigint,
        amountOutMin: bigint,
        recipient?: string
    ) {
        await EVMTokenHelper.approveIfNeeded(wallet, BerachainConsts.KODIAK_ROUTER, tokenIn, amountIn);
        const sc = UniswapV2Router__factory.connect(BerachainConsts.KODIAK_ROUTER, wallet);
        const tx = await sc.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            [
                tokenIn,
                tokenOut
            ],
            recipient ?? wallet.address
        );
        await tx.wait();
        return tx.hash;
    }
    export async function executeSwapV2(
        wallet: Wallet,
        tokenIn: string,
        tokenOut: string,
        amountIn: bigint,
        amountOutMin: bigint,
        recipient?: string
    ) {
        await EVMTokenHelper.approveIfNeeded(wallet, BerachainConsts.KODIAK_ROUTER_V2, tokenIn, amountIn);
        const sc = KodiakRouter02__factory.connect(BerachainConsts.KODIAK_ROUTER_V2, wallet);
        const tx = await sc.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            [
                tokenIn,
                tokenOut
            ],
            recipient ?? wallet.address,
            Date.now() + 1000000
        );
        await tx.wait();
        return tx.hash;
    }
}