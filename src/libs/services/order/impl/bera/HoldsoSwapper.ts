import { Wallet } from "ethers";
import { HoldsoRouter__factory } from "src/contracts";
import { ISwapRouter } from "src/contracts/HoldsoRouter";
import { EVMTokenHelper } from "src/libs/evm/token-helper";
import { BerachainConsts } from "./consts";
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
        await EVMTokenHelper.approveIfNeeded(wallet, BerachainConsts.HOLDSO_ROUTER_ADDRESS, tokenIn, amountIn);
        const routerContract = HoldsoRouter__factory.connect(BerachainConsts.HOLDSO_ROUTER_ADDRESS, wallet);
        const params: ISwapRouter.ExactInputSingleParamsStruct = {
            tokenIn,
            tokenOut,
            fee,
            recipient: recipient ?? wallet.address,
            deadline: Date.now() + 60000,
            amountIn: amountIn,
            amountOutMinimum: amountOutMin,
            sqrtPriceLimitX96: 0n
        }
        const tx = await routerContract.exactInputSingle(params);
        await tx.wait();
        return tx.hash;
    }
}