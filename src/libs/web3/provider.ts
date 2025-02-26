import { ethers } from 'ethers';
import { env } from 'src/config';

export const provider = new ethers.JsonRpcProvider(env.web3.rpc);

export const getBlockNumberCurrent = async () => {
  return await provider.getBlockNumber();
};
