import { Wallet } from "ethers";

export interface IEVMSwapper {
    executeSwap(
        wallet: Wallet,
        tokenIn: string,
        tokenOut: string,
        amountIn: bigint,
        amountOutMin: bigint,
        recipient?: string,
        fee?: bigint,
    ): Promise<string>;

    prepareForSwap(
        wallet: Wallet,
        tokenIn: string,
        tokenOut: string,
        amountIn: bigint,
        amountOutMin: bigint,
        gasPrice: bigint,
        recipient?: string,
        fee?: bigint,
    ): Promise<string>;
}