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
  "ancient8": {
    chainId: 888888888,
    name: "ancient8",
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
  },
  "arbitrum": {
    chainId: 42161,
    name: "arbitrum",
    rpc: env.web3.arbRpc,
    currency: "ETH",
    wrappedNative: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  },
  "zksync": {
    chainId: 324,
    name: "zksync",
    rpc: env.web3.zksyncRpc,
    currency: "ETH",
    wrappedNative: "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91"
  },
  "tron": {
    chainId: 728126428,
    name: "tron",
    rpc: env.web3.tronBase + '/jsonrpc',
    currency: "TRX",
    wrappedNative: "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR"
  }
}

export const NATIVE = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

