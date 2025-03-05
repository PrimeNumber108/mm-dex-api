import { env } from 'src/config';

export type NetworkConfig = {
  name: string,
  rpc: string,
  currency: string,
  chainId: number,
  wrappedNative: string
}
export const NetworkConfigs: {[key: string]: NetworkConfig} = {
  "berachain": {
    chainId: 80094,
    name: "berachain",
    rpc: env.web3.beraRpc,
    currency: "BERA",
    wrappedNative: "0x6969696969696969696969696969696969696969"
  }
}

export const NATIVE = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

