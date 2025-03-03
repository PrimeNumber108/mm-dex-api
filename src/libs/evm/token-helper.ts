import { Wallet } from "ethers";

import { ERC20__factory } from "src/contracts";

export namespace EVMTokenHelper {
  export async function approveToken(
    wallet: Wallet,
    spender: string,
    token: string,
    amount: bigint
  ) {
    const tokenSc = ERC20__factory.connect(token, wallet);
    const tx = await tokenSc.approve(spender, amount);
    await tx.wait();
    console.log(tx.hash)
    return tx.hash;
  }
  export async function approveIfNeeded(
    wallet: Wallet,
    spender: string,
    token: string,
    amount: bigint
  ) {
    const tokenSc = ERC20__factory.connect(token, wallet);
    const allowance = await tokenSc.allowance(wallet.address, spender);
    if (allowance < amount) {
      await approveToken(wallet, spender, token, amount);
    }
  }

  export async function transferToken(wallet: Wallet, token: string, amount: bigint, recipient: string) {
    const tokenContract = ERC20__factory.connect(token, wallet);
    const tx = await tokenContract.transfer(recipient, amount);
    await tx.wait();
    console.log(tx.hash);
  }

}
