import Redis from 'ioredis';
import { MEME_FACTORY_ADDRESS, MEME_FACTORY_BLOCKNUMBER } from './constant';

export enum RedisKey {
  price_native = 'price:native',

  create_meme_offchain = 'create_meme_offchain',

  meme_event_block_number = 'meme_event_block_number',
  meme_whitelist_event_block_number = 'meme_whitelist_event_block_number',

  meme_token_map = 'meme_token_map',
  meme_pump_map = 'meme_pump_map',
  token_pump_map = 'token_pump_map',

  flag = 'flag',
  is_syncing_meme = 'is_syncing_meme',
  is_syncing_analytic = 'is_syncing_analytic',
  is_syncing_offchain_data = 'is_syncing_offchain_data',
  is_syncing_whitelist_buy = 'is_syncing_whitelist_buy',
  is_user_like_comment = 'is_user_like_comment',
  is_exist_swap_request = 'is_exist_swap_request',

  analytic_completed = 'analytic_completed',

  king_of_the_hill = 'king_of_the_hill',
  blocknumber_now = 'blocknumber_now',
}

export const getMemeCheckPoint = async (
  redis: Redis,
  key: RedisKey = RedisKey.meme_event_block_number,
) => {
  const blockNumber = await redis.hget(key, MEME_FACTORY_ADDRESS);
  return blockNumber ? Number(blockNumber) : MEME_FACTORY_BLOCKNUMBER;
};
