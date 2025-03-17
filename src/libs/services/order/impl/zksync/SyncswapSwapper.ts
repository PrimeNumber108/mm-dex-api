import { ContractTransactionResponse, ethers, TransactionRequest, Wallet, ZeroAddress } from "ethers";
import { NATIVE, NetworkConfigs } from "src/libs/consts";
import { EVMTokenHelper } from "src/libs/evm/token-helper";
import { Web3Helper } from "src/libs/services/web3";
import { IEVMSwapper } from "../../IEVMSwapper";
import { ZksyncConsts } from "./consts";
import { SyncswapRouter__factory } from "src/contracts";

export class SyncswapSwapper implements IEVMSwapper {
    async executeSwap(
        wallet: Wallet,
        tokenIn: string,
        tokenOut: string,
        amountIn: bigint,
        amountOutMin: bigint,
        recipient?: string,
        fee?: bigint,
        pair?: string
    ) {
        if (!pair) throw new Error("Pair must be provided");
        const isTokenInNative = tokenIn === NATIVE;

        if (!isTokenInNative)
            await EVMTokenHelper.approveIfNeeded(wallet, ZksyncConsts.SYNCSWAP_ROUTER, tokenIn, amountIn);
        const sc = SyncswapRouter__factory.connect(ZksyncConsts.SYNCSWAP_ROUTER, wallet);
        const tokenInERC20 = Web3Helper.getERC20Representation('zksync', tokenIn);
        const swapData = ethers.AbiCoder.defaultAbiCoder().encode(["address", "address", "uint8"],
            [tokenInERC20, wallet.address, 1]
        );
        const swapSteps = [{
            pool: pair,
            data: swapData,
            callback: ethers.ZeroAddress,
            callbackData: '0x'
        }]
        const paths = [
            {
                steps: swapSteps,
                tokenIn: isTokenInNative ? ethers.ZeroAddress : tokenIn,
                amountIn
            }
        ]
        const deadline = Date.now() + 60000;

        const tx = await sc.swap(paths, amountOutMin, deadline, {
            value: isTokenInNative ? amountIn : 0
        })
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
        fee?: bigint,
        pair?: string
    ) {

        if (!pair) throw new Error("Pair must be provided");

        const isTokenInNative = tokenIn === NATIVE;
        if (!isTokenInNative)
            await EVMTokenHelper.approveIfNeeded(wallet, ZksyncConsts.SYNCSWAP_ROUTER, tokenIn, amountIn);

        const nonce = await wallet.getNonce();

        const tokenInERC20 = Web3Helper.getERC20Representation('zksync', tokenIn);
        const swapData = ethers.AbiCoder.defaultAbiCoder().encode(["address", "address", "uint8"],
            [tokenInERC20, wallet.address, 1]
        );
        const swapSteps = [{
            pool: pair,
            data: swapData,
            callback: ethers.ZeroAddress,
            callbackData: '0x'
        }]
        const paths = [
            {
                steps: swapSteps,
                tokenIn: isTokenInNative ? ethers.ZeroAddress : tokenIn,
                amountIn
            }
        ]
        const deadline = Date.now() + 60000;

        const data = SyncswapRouter__factory.createInterface().encodeFunctionData("swap",
            [
                paths, amountOutMin, deadline
            ]
        )
        const tx: TransactionRequest = {
            from: wallet.address,
            to: ZksyncConsts.SYNCSWAP_ROUTER,
            value: isTokenInNative ? amountIn : 0n,
            data,
            type: 0,
            chainId: NetworkConfigs["zksync"].chainId,
            nonce,
            gasLimit: 300_000n,
            gasPrice
        }

        const signedTx = await wallet.signTransaction(tx);
        return signedTx;
    }
}