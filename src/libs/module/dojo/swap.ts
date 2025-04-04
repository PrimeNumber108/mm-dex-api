import { TransactionRequest, Wallet } from "ethers";
import { CHAIN_ID, DOJO_ROUTER, MAX_UINT256, A8_ADDRESS, PROVIDER, WRAPPED_NATIVE } from "src/libs/utils/constants";
import { DojoRouter__factory, ERC20__factory } from "src/contracts";

export namespace DojoSwap {
    export async function approveIfNeeded(wallet: Wallet, token: string, amount: bigint) {
        const tokenSc = ERC20__factory.connect(token, wallet);
        const allowance = await tokenSc.allowance(wallet.address, DOJO_ROUTER);
        console.log(`Current allowance: ${allowance}, spending: ${amount}`);
        if (allowance < amount) {
            const tx = await tokenSc.approve(DOJO_ROUTER, MAX_UINT256);
            await tx.wait();
            console.log(`Approval tx hash: ${tx.hash}`);
        }
    }

    export async function buyTokenWithETH(
        wallet: Wallet,
        token: string,
        amountIn: bigint,
        recipient?: string
    ) {
        const router = DojoRouter__factory.connect(DOJO_ROUTER, wallet);
        const tx = await router.swapExactETHForTokens(
            0n,
            [
                WRAPPED_NATIVE,
                token
            ],
            recipient ?? wallet.address,
            Date.now() + 100000000,
            {
                value: amountIn
            }
        )
        await tx.wait();
        return tx.hash;
    }

    export async function sellTokenToETH(
        wallet: Wallet,
        token: string,
        amountIn: bigint,
        recipient?: string
    ) {
        await approveIfNeeded(wallet, token, amountIn);
        const router = DojoRouter__factory.connect(DOJO_ROUTER, wallet);
        const tx = await router.swapExactTokensForETH(
            amountIn,
            0n,
            [
                token,
                WRAPPED_NATIVE
            ],
            recipient ?? wallet.address,
            Date.now() + 100000000
        )
        await tx.wait();
        return tx.hash;
    }

    export async function buyTokenWithA8(
        wallet: Wallet,
        token: string,
        amountIn: bigint,
        recipient?: string
    ) {
        const router = DojoRouter__factory.connect(DOJO_ROUTER, wallet);
        await approveIfNeeded(
            wallet,
            A8_ADDRESS,
            amountIn
        )
        const tx = await router.swapExactTokensForTokens(
            amountIn,
            0n,
            [
                A8_ADDRESS,
                token
            ],
            recipient ?? wallet.address,
            Date.now() + 100000000
        )
        await tx.wait();
        return tx.hash;
    }

    export async function sellTokenToA8(
        wallet: Wallet,
        token: string,
        amountIn: bigint,
        recipient?: string
    ) {
        await approveIfNeeded(wallet, token, amountIn);
        const router = DojoRouter__factory.connect(DOJO_ROUTER, wallet);
        const tx = await router.swapExactTokensForTokens(
            amountIn,
            0n,
            [
                token,
                A8_ADDRESS
            ],
            recipient ?? wallet.address,
            Date.now() + 100000000
        )
        await tx.wait();
        return tx.hash;
    }

    export async function fastbuyTokenWithA8(
        wallet: Wallet,
        nonce: number,
        token: string,
        amountIn: bigint,
        recipient?: string
    ) {
        const approvalData = ERC20__factory.createInterface().encodeFunctionData(
            "approve",
            [
                DOJO_ROUTER,
                amountIn
            ]
        )
        const data = DojoRouter__factory.createInterface().encodeFunctionData(
            "swapExactTokensForTokens",
            [
                amountIn,
                0n,
                [
                    A8_ADDRESS,
                    token
                ],
                recipient ?? wallet.address,
                Date.now() + 100000000
            ]
        );
        const approvalTx: TransactionRequest = {
            from: wallet.address,
            to: A8_ADDRESS,
            gasLimit: 100_000n,
            gasPrice: 100_000_000n,
            data: approvalData,
            nonce: nonce++,
            type: 0,
            chainId: BigInt(CHAIN_ID)
        }
        const tx: TransactionRequest = {
            from: wallet.address,
            to: DOJO_ROUTER,
            gasLimit: 1_000_000n,
            gasPrice: 100_000_000n,
            data,
            nonce,
            type: 0,
            chainId: BigInt(CHAIN_ID)
        }

        const signedApprovalTx = await wallet.signTransaction(approvalTx);
        const signedTx = await wallet.signTransaction(tx);
        PROVIDER.broadcastTransaction(signedApprovalTx);
        const receipt = await PROVIDER.broadcastTransaction(signedTx);
        return receipt.hash;
    }
}