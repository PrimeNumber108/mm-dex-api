import { Resolution } from './enum';

export enum EventName {
  SubscribeNewMeme = 'SubscribeNewMeme',
  UnSubscribeNewMeme = 'UnSubscribeNewMeme',

  SubscribeGlobalTrading = 'SubscribeGlobalTrading',
  UnSubscribeGlobalTrading = 'UnSubscribeGlobalTrading',

  SubscribeLastTrading = 'SubscribeLastTrading',
  UnSubscribeLastTrading = 'UnSubscribeLastTrading',

  SubscribeChart = 'SubscribeChart',
  UnSubscribeChart = 'UnSubscribeChart',

  SubscribeComment = 'SubscribeComment',
  UnSubscribeComment = 'UnSubscribeComment',
}

export enum RoomName {
  Chart = 'Chart',
  Global = 'Global',
  Comment = 'Comment',
  LastTrade = 'LastTrade',
}

export const getKeyLastTradingRoom = (tokenAddress: string) => {
  return `${RoomName.LastTrade}:${tokenAddress}`;
};

export const getKeyCommentRoom = (tokenAddress: string) => {
  return `${RoomName.Comment}:${tokenAddress}`;
};

export const getKeyChartRoom = (
  tokenAddress: string,
  resolution: Resolution,
) => {
  return `${RoomName.Chart}:${tokenAddress}:${resolution}`;
};
