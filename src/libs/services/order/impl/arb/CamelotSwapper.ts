import { ContractTransactionResponse, TransactionRequest, Wallet, ZeroAddress } from "ethers";
import { CamelotRouter__factory } from "src/contracts";
import { ARBConsts } from "./consts";
import { NATIVE, NetworkConfigs } from "src/libs/consts";
import { EVMTokenHelper } from "src/libs/evm/token-helper";
import { Web3Helper } from "src/libs/services/web3";
import { IEVMSwapper } from "../../IEVMSwapper";

export class CamelotSwapper implements IEVMSwapper {
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
            await EVMTokenHelper.approveIfNeeded(wallet, ARBConsts.CAMELOT_V2_ROUTER, tokenIn, amountIn);
        const sc = CamelotRouter__factory.connect(ARBConsts.CAMELOT_V2_ROUTER, wallet);
        let tx: ContractTransactionResponse;

        if (!isTokenInNative && !isTokenOutNative) {
            tx = await sc.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                amountIn,
                amountOutMin,
                [
                    Web3Helper.getERC20Representation('a8', tokenIn),
                    Web3Helper.getERC20Representation('a8', tokenOut)
                ],
                recipient ?? wallet.address,
                ZeroAddress,
                Date.now() + 60000,
            );
        } else if (isTokenInNative) {
            tx = await sc.swapExactETHForTokensSupportingFeeOnTransferTokens(
                amountOutMin,
                [
                    Web3Helper.getERC20Representation('a8', tokenIn),
                    Web3Helper.getERC20Representation('a8', tokenOut)
                ],
                recipient ?? wallet.address,
                ZeroAddress,
                Date.now() + 60000,

                {
                    value: amountIn
                }
            )
        } else if (isTokenOutNative) {
            tx = await sc.swapExactTokensForETHSupportingFeeOnTransferTokens(
                amountIn,
                amountOutMin,
                [
                    Web3Helper.getERC20Representation('a8', tokenIn),
                    Web3Helper.getERC20Representation('a8', tokenOut)
                ],
                recipient ?? wallet.address,
                ZeroAddress,
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
            await EVMTokenHelper.approveIfNeeded(wallet, ARBConsts.CAMELOT_V2_ROUTER, tokenIn, amountIn);

        const nonce = await wallet.getNonce();
        let data: string;

        if (!isTokenInNative && !isTokenOutNative) {
            data = CamelotRouter__factory.createInterface().encodeFunctionData(
                "swapExactTokensForTokensSupportingFeeOnTransferTokens",
                [
                    amountIn,
                    amountOutMin,
                    [
                        Web3Helper.getERC20Representation('a8', tokenIn),
                        Web3Helper.getERC20Representation('a8', tokenOut)
                    ],
                    recipient ?? wallet.address,
                    ZeroAddress,
                    Date.now() + 60000
                ]
            )
        } else if (isTokenInNative) {
            data = CamelotRouter__factory.createInterface().encodeFunctionData(
                "swapExactETHForTokensSupportingFeeOnTransferTokens",
                [
                    amountOutMin,
                    [
                        Web3Helper.getERC20Representation('a8', tokenIn),
                        Web3Helper.getERC20Representation('a8', tokenOut)
                    ],
                    recipient ?? wallet.address,
                    ZeroAddress,
                    Date.now() + 60000
                ]
            )
        } else if (isTokenOutNative) {
            data = CamelotRouter__factory.createInterface().encodeFunctionData(
                "swapExactTokensForETHSupportingFeeOnTransferTokens",
                [
                    amountIn,
                    amountOutMin,
                    [
                        Web3Helper.getERC20Representation('a8', tokenIn),
                        Web3Helper.getERC20Representation('a8', tokenOut)
                    ],
                    recipient ?? wallet.address,
                    ZeroAddress,
                    Date.now() + 60000
                ]
            )
        }
        const tx: TransactionRequest = {
            from: wallet.address,
            to: ARBConsts.CAMELOT_V2_ROUTER,
            value: isTokenInNative ? amountIn : 0n,
            data,
            type: 0,
            chainId: NetworkConfigs["arbitrum"].chainId,
            nonce,
            gasLimit: 300_000n,
            gasPrice
        }

        const signedTx = await wallet.signTransaction(tx);
        return signedTx;
    }
}