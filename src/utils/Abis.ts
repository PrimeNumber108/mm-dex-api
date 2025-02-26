import { keccak256, toUtf8Bytes } from 'ethers';

export const memeAbiInterface = [
  'event Buy(address,uint256,uint256,uint256,uint256)',
  'event Sell(address,uint256,uint256,uint256,uint256)',
  'event MemeCreated(address,address,uint256,uint256,uint256,uint256,uint256,bool)',
  'event List(uint256,uint256,address)',
  'event WhitelistBuy(address,uint256,uint256,address indexed)',
];

export enum MemeAbi {
  Buy = 'Buy(address,uint256,uint256,uint256,uint256)',
  Sell = 'Sell(address,uint256,uint256,uint256,uint256)',
  MemeCreated = 'MemeCreated(address,address,uint256,uint256,uint256,uint256,uint256,bool)',
  List = 'List(uint256,uint256,address)',
  WhitelistBuy = 'WhitelistBuy(address,uint256,uint256,address)',
}
