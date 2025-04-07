export interface ITronVMSwapper {
    executeSwap(
        privateKey: string,
        tokenIn: string,
        tokenOut: string,
        amountIn: bigint,
        amountOutMin: bigint,
        recipient?: string,
        fee?: bigint,
        pair?: string,
    ): Promise<string>;

    prepareForSwap(
        privateKey: string,
        tokenIn: string,
        tokenOut: string,
        amountIn: bigint,
        amountOutMin: bigint,
        gasPrice: bigint,
        recipient?: string,
        fee?: bigint,
        pair?: string
    ): Promise<string>;
}