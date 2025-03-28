import { ethers, JsonRpcProvider } from "ethers";
import { env } from "src/config";

export const PROVIDER = new JsonRpcProvider(env.network === 'mainnet' ? env.a8.mainnetRpc : env.a8.testnetRpc);

export const A8_ADDRESS = env.network === 'mainnet' ? '0xD812d616A7C54ee1C8e9c9CD20D72090bDf0d424' : '0xfC57492d6569f6F45Ea1b8850e842Bf5F9656EA6';
export const DOJO_ROUTER = env.network === 'mainnet' ? '0x88030786602B30f41E9e8ADAfaFb2A7C16A4dBBF' : '0xb4EE3D56ca23d056345ac771297e42Ce108f0F62';
export const A8_PAIR = env.network === 'mainnet' ? '0xd907efdb8d52edd6917263f24db230b525a3ef0b' : '0x3D60aFEcf67e6ba950b499137A72478B2CA7c5A1';

export const NATIVE = ethers.ZeroAddress;
export const WRAPPED_NATIVE = '0x4200000000000000000000000000000000000006';

export const MULTICALL_ADDRESS = env.network === 'mainnet' ? '0xeD65d837d2e525a56fcBC9E99F398C1ca8157cf4' : '0xcA11bde05977b3631167028862bE2a173976CA11';

export const A8_FACTORY = env.network === 'mainnet' ? '0x9170b4103052DB43641F747366aD8dc9f404B468' : '0x876fcB63F8684CEF127CA4b1Be149C6D6AbEB78A';

export const CHAIN_ID = env.network === 'mainnet' ? 888888888 : 28122024;
export const MAX_UINT256 = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export interface TokenConfigInfo {
    address: string,
    pair: string,
    symbol: string,
  }
  export const TokenConfig = {
    KAORI: {
      address: "0x023c1b8041f9f8ac9a10ebbdde3058b46c6efe0a",
      pair: '0x79b078a4ffd34aa103bbfdf48426a3d390b98dd9',
      symbol: 'KAORI'
    }
  }