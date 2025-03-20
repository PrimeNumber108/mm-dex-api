import { ContractTransactionResponse, TransactionRequest, Wallet } from "ethers";
import { NATIVE, NetworkConfigs } from "src/libs/consts";
import { EVMTokenHelper } from "src/libs/evm/token-helper";
import { A8Consts } from "./consts";
import { DojoRouter__factory } from "src/contracts/factories";
import { Web3Helper } from "src/libs/services/web3";
import { IEVMSwapper } from "../../IEVMSwapper";

export class DojoSwapper implements IEVMSwapper {
    async executeSwap(
        wallet: Wallet,
        tokenIn: string,
        tokenOut: string,
        amountIn: bigint,
        amountOutMin: bigint,
        recipient?: string
    ) {
        const isTokenInNative = tokenIn === NATIVE;
        const isTokenOutNative = tokenOut === NATIVE;

        if (!isTokenInNative)
            await EVMTokenHelper.approveIfNeeded(wallet, A8Consts.DOJO_ROUTER, tokenIn, amountIn);
        const sc = DojoRouter__factory.connect(A8Consts.DOJO_ROUTER, wallet);
        let tx: ContractTransactionResponse;

        if (!isTokenInNative && !isTokenOutNative) {
            tx = await sc.swapExactTokensForTokens(
                amountIn,
                amountOutMin,
                [
                    Web3Helper.getERC20Representation('ancient8', tokenIn),
                    Web3Helper.getERC20Representation('ancient8', tokenOut)
                ],
                recipient ?? wallet.address,
                Date.now() + 60000,
            );
        } else if (isTokenInNative) {
            tx = await sc.swapExactETHForTokens(
                amountOutMin,
                [
                    Web3Helper.getERC20Representation('ancient8', tokenIn),
                    Web3Helper.getERC20Representation('ancient8', tokenOut)
                ],
                recipient ?? wallet.address,
                Date.now() + 60000,

                {
                    value: amountIn
                }
            )
        } else if (isTokenOutNative) {
            tx = await sc.swapExactTokensForETH(
                amountIn,
                amountOutMin,
                [
                    Web3Helper.getERC20Representation('ancient8', tokenIn),
                    Web3Helper.getERC20Representation('ancient8', tokenOut)
                ],
                recipient ?? wallet.address,
                Date.now() + 60000,
            )
        }
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
        const isTokenOutNative = tokenOut === NATIVE;
        if (!isTokenInNative)
            await EVMTokenHelper.approveIfNeeded(wallet, A8Consts.DOJO_ROUTER, tokenIn, amountIn);

        const nonce = await wallet.getNonce();
        let data: string;

        if (!isTokenInNative && !isTokenOutNative) {
            data = DojoRouter__factory.createInterface().encodeFunctionData(
                "swapExactTokensForTokens",
                [
                    amountIn,
                    amountOutMin,
                    [
                        Web3Helper.getERC20Representation('ancient8', tokenIn),
                        Web3Helper.getERC20Representation('ancient8', tokenOut)
                    ],
                    recipient ?? wallet.address,
                    Date.now() + 60000
                ]
            )
        } else if (isTokenInNative) {
            data = DojoRouter__factory.createInterface().encodeFunctionData(
                "swapExactETHForTokens",
                [
                    amountOutMin,
                    [
                        Web3Helper.getERC20Representation('ancient8', tokenIn),
                        Web3Helper.getERC20Representation('ancient8', tokenOut)
                    ],
                    recipient ?? wallet.address,
                    Date.now() + 60000
                ]
            )
        } else if (isTokenOutNative) {
            data = DojoRouter__factory.createInterface().encodeFunctionData(
                "swapExactTokensForETH",
                [
                    amountIn,
                    amountOutMin,
                    [
                        Web3Helper.getERC20Representation('ancient8', tokenIn),
                        Web3Helper.getERC20Representation('ancient8', tokenOut)
                    ],
                    recipient ?? wallet.address,
                    Date.now() + 60000
                ]
            )
        }
        const tx: TransactionRequest = {
            from: wallet.address,
            to: A8Consts.DOJO_ROUTER,
            value: isTokenInNative ? amountIn : 0n,
            data,
            type: 0,
            chainId: NetworkConfigs["ancient8"].chainId,
            nonce,
            gasLimit: 300_000n,
            gasPrice
        }

        const signedTx = await wallet.signTransaction(tx);
        return signedTx;
    }
}