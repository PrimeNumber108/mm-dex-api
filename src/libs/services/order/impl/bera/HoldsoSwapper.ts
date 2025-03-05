import { TransactionRequest, Wallet } from "ethers";
import { HoldsoRouter__factory } from "src/contracts";
import { ISwapRouter } from "src/contracts/HoldsoRouter";
import { EVMTokenHelper } from "src/libs/evm/token-helper";
import { BerachainConsts } from "./consts";
import { NATIVE, NetworkConfigs } from "src/libs/consts";
import { Web3Helper } from "src/libs/services/web3";
export namespace HoldsoSwapper {

    export async function executeSwap(
        wallet: Wallet,
        tokenIn: string,
        tokenOut: string,
        fee: bigint,
        amountIn: bigint,
        amountOutMin: bigint,
        recipient?: string
    ) {
        if (tokenIn !== NATIVE)
            await EVMTokenHelper.approveIfNeeded(wallet, BerachainConsts.HOLDSO_ROUTER_ADDRESS, tokenIn, amountIn);
        const routerContract = HoldsoRouter__factory.connect(BerachainConsts.HOLDSO_ROUTER_ADDRESS, wallet);
        const params: ISwapRouter.ExactInputSingleParamsStruct = {
            tokenIn: Web3Helper.getERC20Representation('berachain', tokenIn),
            tokenOut: Web3Helper.getERC20Representation('berachain', tokenOut),
            fee,
            recipient: recipient ?? wallet.address,
            deadline: Date.now() + 60000,
            amountIn: amountIn,
            amountOutMinimum: amountOutMin,
            sqrtPriceLimitX96: 0n
        }
        const tx = await routerContract.exactInputSingle(params, {
            value: tokenIn === NATIVE ? amountIn : 0n
        });
        await tx.wait();
        return tx.hash;
    }

    export async function prepareForSwap(
        wallet: Wallet,
        tokenIn: string,
        tokenOut: string,
        fee: bigint,
        amountIn: bigint,
        amountOutMin: bigint,
        gasPrice: bigint,
        recipient?: string
    ) {

        const isTokenInNative = tokenIn === NATIVE;

        if (!isTokenInNative)
            await EVMTokenHelper.approveIfNeeded(wallet, BerachainConsts.HOLDSO_ROUTER_ADDRESS, tokenIn, amountIn);

        const nonce = await wallet.getNonce();
        const params: ISwapRouter.ExactInputSingleParamsStruct = {
            tokenIn: Web3Helper.getERC20Representation('berachain', tokenIn),
            tokenOut: Web3Helper.getERC20Representation('berachain', tokenOut),
            fee,
            recipient: recipient ?? wallet.address,
            deadline: Date.now() + 60000,
            amountIn: amountIn,
            amountOutMinimum: amountOutMin,
            sqrtPriceLimitX96: 0n
        }
        const data = HoldsoRouter__factory.createInterface().encodeFunctionData(
            "exactInputSingle",
            [
                params
            ]
        )
        const tx: TransactionRequest = {
            from: wallet.address,
            to: BerachainConsts.HOLDSO_ROUTER_ADDRESS,
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