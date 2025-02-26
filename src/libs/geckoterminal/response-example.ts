interface PriceChangePercentage {
  m5: string;
  h1: string;
  h6: string;
  h24: string;
}

interface TransactionStats {
  buys: number;
  sells: number;
  buyers: number;
  sellers: number;
}

interface Transactions {
  m5: TransactionStats;
  m15: TransactionStats;
  m30: TransactionStats;
  h1: TransactionStats;
  h24: TransactionStats;
}

interface VolumeUSD {
  m5: string;
  h1: string;
  h6: string;
  h24: string;
}

interface PoolAttributes {
  base_token_price_usd: string;
  base_token_price_native_currency: string;
  quote_token_price_usd: string;
  quote_token_price_native_currency: string;
  base_token_price_quote_token: string;
  quote_token_price_base_token: string;
  address: string;
  name: string;
  pool_created_at: string;
  fdv_usd: string;
  market_cap_usd: string | null;
  price_change_percentage: PriceChangePercentage;
  transactions: Transactions;
  volume_usd: VolumeUSD;
  reserve_in_usd: string;
}

interface RelationshipData {
  id: string;
  type: string;
}

interface Relationships {
  base_token: { data: RelationshipData };
  quote_token: { data: RelationshipData };
  dex: { data: RelationshipData };
}

interface PoolData {
  id: string;
  type: string;
  attributes: PoolAttributes;
  relationships: Relationships;
}

export interface GeckoTerminalResponse {
  data: PoolData;
}

export interface AnalyticPoolData {
  price24hChange: string;
  liquidity: string;
  priceByNative: string;
  priceByUsd: string;
}
