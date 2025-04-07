import { TronWeb } from 'tronweb';
import { ApiKeysRotator } from './api-keys';
import { env } from 'src/config';

const defaultPk = 'ad31907f26591f107aabc4b44baa85ca3dc3d1518bdaa1fbd33ee33157613ec8'
export function tronWeb(pk: string){
  const tw = new TronWeb({
    fullHost: env.web3.tronBase,
    headers: {
      'TRON-PRO-API-KEY': ApiKeysRotator.getApiKey(),
    },
    eventServer: env.web3.tronBase,
    privateKey: pk,
  })
  return tw;
}

export function tronWebFromMnemonic(mnemonic: string){
  const wallet = TronWeb.fromMnemonic(mnemonic);
  return tronWeb(wallet.privateKey);
}

export const defaultTronWeb = tronWeb(defaultPk);
