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
  },
  "a8": {
    chainId: 888888888,
    name: "a8",
    rpc: env.web3.a8Rpc,
    currency: "ETH",
    wrappedNative: "0x4200000000000000000000000000000000000006"
  },
  "metis": {
    chainId: 1088,
    name: "metis",
    rpc: env.web3.metisRpc,
    currency: "METIS",
    wrappedNative: "0x75cb093E4D61d2A2e65D8e0BBb01DE8d89b53481"
  }
}

export const NATIVE = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

