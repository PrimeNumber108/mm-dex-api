import { NATIVE } from "src/libs/consts";
import { ITronVMSwapper } from "../../ITronVMSwapper";
import { TronVMTokenHelper } from "src/libs/tron/token-helper";
import { TronConsts } from "./consts";
import { tronWeb } from "src/libs/tron/tronweb";
import { loadAbi } from "src/config/abi-loader";
import { Web3Helper } from "src/libs/services/web3";

const routerAbi = loadAbi("SunswapV2Router");

export class SunswapV2Swapper implements ITronVMSwapper {
    async executeSwap(
        pk: string,
        tokenIn: string,
        tokenOut: string,
        amountIn: bigint,
        amountOutMin: bigint,
        recipient?: string
    ) {
        const isTokenInNative = tokenIn === NATIVE;
        const isTokenOutNative = tokenOut === NATIVE;

        const deadline = Date.now() + 60000;

        if (!isTokenInNative)
            await TronVMTokenHelper.approveIfNeeded(pk, TronConsts.SUNSWAP_V2_ROUTER, tokenIn, amountIn);

        const path = [
            Web3Helper.getERC20Representation('tron', tokenIn),
            Web3Helper.getERC20Representation('tron', tokenOut)
        ]
        const sc = tronWeb(pk).contract(routerAbi, TronConsts.SUNSWAP_V2_ROUTER);
        let res;

        if (!isTokenInNative && !isTokenOutNative) {
            res = await sc.methods.swapExactTokensForTokens(
                amountIn,
                amountOutMin, path,
                recipient,
                deadline,
            ).send({
                feeLimit: 100_000_000,
                callValue: 0
            });
        } else if (isTokenInNative) {
            res = await sc.methods.swapExactETHForTokens(
                amountOutMin, path,
                recipient,
                deadline,
            ).send({
                feeLimit: 100_000_000,
                callValue: Number(amountIn.toString(10)),
            });
        } else if (isTokenOutNative) {
            res = await sc.methods.swapExactTokensForETH(
                amountIn,
                amountOutMin, path,
                recipient,
                deadline,
            ).send({
                feeLimit: 100_000_000,
                callValue: 0
            });
        }
        return res;
    }

    async prepareForSwap(
        pk: string,
        tokenIn: string,
        tokenOut: string,
        amountIn: bigint,
        amountOutMin: bigint,
        gasPrice: bigint,
        recipient?: string
    ) {
        const tw = tronWeb(pk)
        const isTokenInNative = tokenIn === NATIVE;
        const isTokenOutNative = tokenOut === NATIVE;

        const path = [
            Web3Helper.getERC20Representation('tron', tokenIn),
            Web3Helper.getERC20Representation('tron', tokenOut)
        ]

        const deadline = Date.now() + 60000;

        if (!isTokenInNative)
            await TronVMTokenHelper.approveIfNeeded(pk, TronConsts.SUNSWAP_V2_ROUTER, tokenIn, amountIn);

        let tx;

        if (!isTokenInNative && !isTokenOutNative) {
            const selector = 'swapExactTokensForTokens(uint256, uint256, address[], address, uint256)';
            const params = [
                {
                    type: 'uint256',
                    value: amountIn
                },
                {
                    type: 'uint256',
                    value: amountOutMin
                },
                {
                    type: 'address[]',
                    value: path
                },
                {
                    type: 'address',
                    value: recipient
                },
                {
                    type: 'uint256',
                    value: deadline
                }
            ]
            tx = await tw.transactionBuilder.triggerSmartContract(TronConsts.SUNSWAP_V2_ROUTER, selector, {
                feeLimit: 100_000_000,
            }, params);
        } else if (isTokenInNative) {
            const selector = 'swapExactETHForTokens(uint256, address[], address, uint256)';
            const params = [
                {
                    type: 'uint256',
                    value: amountOutMin
                },
                {
                    type: 'address[]',
                    value: path
                },
                {
                    type: 'address',
                    value: recipient
                },
                {
                    type: 'uint256',
                    value: deadline
                }
            ]
            tx = await tw.transactionBuilder.triggerSmartContract(TronConsts.SUNSWAP_V2_ROUTER, selector, {
                feeLimit: 100_000_000,
                callValue: Number(amountIn.toString(10)),
            }, params);
        } else if (isTokenOutNative) {
            const selector = 'swapExactTokensForETH(uint256, uint256, address[], address, uint256)';
            const params = [
                {
                    type: 'uint256',
                    value: amountIn
                },
                {
                    type: 'uint256',
                    value: amountOutMin
                },
                {
                    type: 'address[]',
                    value: path
                },
                {
                    type: 'address',
                    value: recipient
                },
                {
                    type: 'uint256',
                    value: deadline
                }
            ]
            tx = await tw.transactionBuilder.triggerSmartContract(TronConsts.SUNSWAP_V2_ROUTER, selector, {
                feeLimit: 100_000_000,
            }, params);
        }
        return await tw.trx.sign(tx.transaction);
    }
}