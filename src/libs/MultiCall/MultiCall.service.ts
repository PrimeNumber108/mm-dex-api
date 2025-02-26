import { Contract } from 'ethers';
import { provider } from '../web3/provider';
import { Aggregate3Response, MemeDataOnChain } from './MultiCallSchema';
import {
  MEME_FACTORY_ADDRESS,
  MULTICALL_ABI_ETHERS,
  MULTICALL_ADDRESS,
} from 'src/utils/constant';
import { ERC20__factory } from 'src/contracts';

const ERC20Interface = ERC20__factory.createInterface();

export class MultiCallService {
  private readonly multiCall = new Contract(
    MULTICALL_ADDRESS,
    MULTICALL_ABI_ETHERS,
    provider,
  );

  private getNameCall(tokenAddress: string) {
    return {
      target: tokenAddress,
      allowFailure: false,
      callData: ERC20Interface.encodeFunctionData('name'),
    };
  }

  private getSymbolCall(tokenAddress: string) {
    return {
      target: tokenAddress,
      allowFailure: false,
      callData: ERC20Interface.encodeFunctionData('symbol'),
    };
  }

  private getDecimalsCall(tokenAddress: string) {
    return {
      target: tokenAddress,
      allowFailure: false,
      callData: ERC20Interface.encodeFunctionData('decimals'),
    };
  }

  async getMemeTokenData(tokenAddress: string, pumpAddress: string) {
    try {
      const result: Aggregate3Response[] =
        await this.multiCall.aggregate3.staticCall([
          this.getNameCall(tokenAddress),
          this.getSymbolCall(tokenAddress),
          this.getDecimalsCall(tokenAddress),
        ]);
      const tokenData: MemeDataOnChain = {
        name: ERC20Interface.decodeFunctionResult(
          'name',
          result[0].returnData,
        )[0].toString(),
        symbol: ERC20Interface.decodeFunctionResult(
          'symbol',
          result[1].returnData,
        )[0].toString(),
        decimals: ERC20Interface.decodeFunctionResult(
          'decimals',
          result[2].returnData,
        )[0].toString(),
      };
      return tokenData;
    } catch (err) {
      console.log(err);
      return {
        name: '',
        symbol: '',
        decimals: '',
      } as MemeDataOnChain;
    }
  }
}

export const multiCallService = new MultiCallService();
