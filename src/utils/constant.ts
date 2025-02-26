import { env } from 'src/config';

export const MEME_FACTORY_ADDRESS =
  env.network === 'mainnet'
    ? '0x5e0A0e0932a5e0a3ba83f5aebd5F166cd9908b13'
    : '0x876fcB63F8684CEF127CA4b1Be149C6D6AbEB78A';
export const MEME_FACTORY_BLOCKNUMBER =
  env.network === 'mainnet' ? 16336212 : 17703292;

export const NATIVE_SCALE = 1e18;

export const EXPIRED_OFF_CHAIN_DATA_TIME = 10 * 60 * 1000; // 10 minutes

export const MULTICALL_ADDRESS =
  env.network === 'mainnet'
    ? '0xeD65d837d2e525a56fcBC9E99F398C1ca8157cf4'
    : '0xcA11bde05977b3631167028862bE2a173976CA11';
export const NATIVE_ADDRESS = '0x3E5A19c91266aD8cE2477B91585d1856B84062dF';
export const MULTICALL_ABI_ETHERS = [
  // https://github.com/mds1/multicall
  'function aggregate(tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes[] returnData)',
  'function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)',
  'function aggregate3Value(tuple(address target, bool allowFailure, uint256 value, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)',
  'function blockAndAggregate(tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes32 blockHash, tuple(bool success, bytes returnData)[] returnData)',
  'function getBasefee() view returns (uint256 basefee)',
  'function getBlockHash(uint256 blockNumber) view returns (bytes32 blockHash)',
  'function getBlockNumber() view returns (uint256 blockNumber)',
  'function getChainId() view returns (uint256 chainid)',
  'function getCurrentBlockCoinbase() view returns (address coinbase)',
  'function getCurrentBlockDifficulty() view returns (uint256 difficulty)',
  'function getCurrentBlockGasLimit() view returns (uint256 gaslimit)',
  'function getCurrentBlockTimestamp() view returns (uint256 timestamp)',
  'function getEthBalance(address addr) view returns (uint256 balance)',
  'function getLastBlockHash() view returns (bytes32 blockHash)',
  'function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)',
  'function tryBlockAndAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes32 blockHash, tuple(bool success, bytes returnData)[] returnData)',
];

export const EXPIRED_SWAP_REQUEST_BLOCK = 100000; // 100000 blocks
