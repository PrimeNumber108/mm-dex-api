import { TransactionRequest, Wallet } from "ethers";
import { HoldsoRouter__factory } from "src/contracts";
import { ISwapRouter } from "src/contracts/HoldsoRouter";
import { EVMTokenHelper } from "src/libs/evm/token-helper";
import { BerachainConsts } from "./consts";
import { NATIVE, NetworkConfigs } from "src/libs/consts";
import { Web3Helper } from "src/libs/services/web3";
import { IEVMSwapper } from "../../IEVMSwapper";
export class HoldsoSwapper implements IEVMSwapper {
    async executeSwap(
        wallet: Wallet,
        tokenIn: string,
        tokenOut: string,
        amountIn: bigint,
        amountOutMin: bigint,
        recipient?: string,
        fee?: bigint,
    ) {
        if (tokenIn !== NATIVE)
            await EVMTokenHelper.approveIfNeeded(wallet, BerachainConsts.HOLDSO_ROUTER_ADDRESS, tokenIn, amountIn);
        const routerContract = HoldsoRouter__factory.connect(BerachainConsts.HOLDSO_ROUTER_ADDRESS, wallet);
        const params: ISwapRouter.ExactInputSingleParamsStruct = {
            tokenIn: Web3Helper.getERC20Representation('berachain', tokenIn),
            tokenOut: Web3Helper.getERC20Representation('berachain', tokenOut),
            fee: fee ?? BigInt(3000),
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

    async prepareForSwap(
        wallet: Wallet,
        tokenIn: string,
        tokenOut: string,
        amountIn: bigint,
        amountOutMin: bigint,
        gasPrice: bigint,
        recipient?: string,
        fee?: bigint
    ) {

        const isTokenInNative = tokenIn === NATIVE;

        if (!isTokenInNative)
            await EVMTokenHelper.approveIfNeeded(wallet, BerachainConsts.HOLDSO_ROUTER_ADDRESS, tokenIn, amountIn);

        const nonce = await wallet.getNonce();
        const params: ISwapRouter.ExactInputSingleParamsStruct = {
            tokenIn: Web3Helper.getERC20Representation('berachain', tokenIn),
            tokenOut: Web3Helper.getERC20Representation('berachain', tokenOut),
            fee: fee ?? BigInt(3000),
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