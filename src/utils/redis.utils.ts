import Redis from 'ioredis';
import { RedisKey } from './RedisKey';

export const setSyncingLock = async (redis: Redis, name: string, limit = 10) => {
  const key = `${RedisKey.flag}:${name}`;
  const result = await redis.set(key, '1', 'NX');
  if (result) {
    await redis.expire(key, limit);
  }
  return result;
};

export const releaseSyncingLock = async (redis: Redis, name: string) => {
  const key = `${RedisKey.flag}:${name}`;
  await redis.del(key);
};

export const isSyncing = async (redis: Redis, name: string) => {
  const key = `${RedisKey.flag}:${name}`;
  return await redis.get(key);
};
