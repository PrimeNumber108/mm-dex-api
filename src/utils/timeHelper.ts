import BigNumber from 'bignumber.js';
import { Resolution } from './enum';

export const getTimestampInSeconds = () => {
  // Get the current timestamp in milliseconds
  const timestampMs = Date.now();

  // Convert milliseconds to seconds and return
  return Math.floor(timestampMs / 1000);
};

export const getSpecificTimeInSeconds = (
  date: Date | undefined = undefined,
) => {
  if (!date) {
    return getTimestampInSeconds();
  }
  return Math.floor(date.getTime() / 1000);
};

//date is timestamp in second
export const getTimeWithResolution = (
  date: number,
  resolution: Resolution | string,
) => {
  return date - (date % +resolution);
};

export const getTimeNowWithResolution = (resolution: Resolution) => {
  const date = getTimestampInSeconds();

  return getTimeWithResolution(date, resolution);
};

export const getTimeWithOneDayResolution = (date: number) => {
  return getTimeWithResolution(date, Resolution.OneDay);
};

export function normalizeNumber(number: string): number {
  const MAX_SAFE_INTEGER = 9007199254740991;
  return BigNumber(number).isGreaterThan(MAX_SAFE_INTEGER)
    ? MAX_SAFE_INTEGER
    : Number(number);
}
