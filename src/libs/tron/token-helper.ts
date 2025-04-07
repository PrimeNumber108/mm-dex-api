import { defaultTronWeb, tronWeb } from "./tronweb";
import { TronWeb } from "tronweb";
import { NATIVE } from "../consts";
import { loadAbi } from "src/config/abi-loader";
import { MaxUint256 } from "ethers";

const trc10Abi = loadAbi('ERC20')
export namespace TronVMTokenHelper {

    export async function balanceOf(address: string, account: string): Promise<bigint> {
        const token = defaultTronWeb.contract(trc10Abi, address);
        return await token['balanceOf'](account).call();
    }

    export async function allowance(address: string, owner: string, spender: string) {
        const token = defaultTronWeb.contract(trc10Abi, address);
        return await token['allowance'](owner, spender).call();
    }

    export async function approveToken(
        pk: string,
        spender: string,
        token: string,
        amount: bigint
    ) {
        const tokenSc = tronWeb(pk).contract(trc10Abi, token);
        return await tokenSc.methods.approve(spender, amount).send({
            feeLimit: 100_000_000,
            callValue: 0
        });
    }

    export async function approveIfNeeded(
        pk: string,
        spender: string,
        token: string,
        amount: bigint
    ) {
        const account = TronWeb.address.fromPrivateKey(pk) as string;
        const al = await allowance(token, account, spender);
        if (al < amount) {
            await approveToken(pk, spender, token, MaxUint256);
        }
    }

    export async function transferTRX(pk: string, recipient: string, amount: bigint) {
        const tw = tronWeb(pk);
        const txObj = await tw.transactionBuilder.sendTrx(recipient, Number(amount.toString(10)));
        const signedtxn = await tw.trx.sign(txObj, pk);
        return await tw.trx.sendRawTransaction(signedtxn);
    }

    export async function transferToken(pk: string, token: string, recipient: string, amount: bigint) {
        if (token === NATIVE) return await transferTRX(pk, recipient, amount);
        const tokenSc = tronWeb(pk).contract(trc10Abi, token);
        return await tokenSc.methods.transfer(recipient, amount).send({
            feeLimit: 100_000_000,
            callValue: 0
        });
    }

}
