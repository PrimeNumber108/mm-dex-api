import { TransactionRequest, Wallet } from "ethers";
import { UniswapV2Router__factory } from "src/contracts/factories";
import { EVMTokenHelper } from "src/libs/evm/token-helper";
import { BerachainConsts } from "./consts";
import { NATIVE, NetworkConfigs } from "src/libs/consts";
import { Web3Helper } from "src/libs/services/web3";
import { IEVMSwapper } from "../../IEVMSwapper";

export class KodiakSwapper implements IEVMSwapper {
    async executeSwap(
        wallet: Wallet,
        tokenIn: string,
        tokenOut: string,
        amountIn: bigint,
        amountOutMin: bigint,
        recipient?: string
    ) {
        const isTokenInNative = tokenIn === NATIVE;
        if (!isTokenInNative)
            await EVMTokenHelper.approveIfNeeded(wallet, BerachainConsts.KODIAK_ROUTER, tokenIn, amountIn);
        const sc = UniswapV2Router__factory.connect(BerachainConsts.KODIAK_ROUTER, wallet);
        const tx = await sc.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            [
                Web3Helper.getERC20Representation('berachain', tokenIn),
                Web3Helper.getERC20Representation('berachain', tokenOut)
            ],
            recipient ?? wallet.address,
            {
                value: isTokenInNative ? amountIn : 0n
            }
        );
        await tx.wait();
        return tx.hash;
    }

    async prepareForSwap(
        wallet: Wallet,
        tokenIn: string,
        tokenOut: string,
        amountIn: bigint,
        amountOutMin: bigint,
        gasPrice: bigint,
        recipient?: string
    ) {

        const isTokenInNative = tokenIn === NATIVE;

        if (!isTokenInNative)
            await EVMTokenHelper.approveIfNeeded(wallet, BerachainConsts.KODIAK_ROUTER, tokenIn, amountIn);

        const nonce = await wallet.getNonce();
        const data = UniswapV2Router__factory.createInterface().encodeFunctionData(
            "swapExactTokensForTokens",
            [
                amountIn,
                amountOutMin,
                [
                    Web3Helper.getERC20Representation('berachain', tokenIn),
                    Web3Helper.getERC20Representation('berachain', tokenOut)
                ],
                recipient ?? wallet.address,
            ]
        )
        const tx: TransactionRequest = {
            from: wallet.address,
            to: BerachainConsts.KODIAK_ROUTER,
            value: isTokenInNative ? amountIn : 0n,
            data,
            type: 0,
            chainId: NetworkConfigs["berachain"].chainId,
            nonce,
            gasLimit: 300_000n,
            gasPrice
        }

        const signedTx = await wallet.signTransaction(tx);
        return signedTx;
    }
}