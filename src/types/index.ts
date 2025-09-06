export interface MarketData {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  timestamp: string;
}

export interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Market {
  id: string;
  name: string;
  region: 'US' | 'CN' | 'HK' | 'Global';
  symbols: string[];
}

export interface CommodityData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  unit: string;
  category: 'Energy' | 'Metals' | 'Agriculture';
}

export interface ForexData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  baseCurrency: string;
  quoteCurrency: string;
  timestamp: string;
}

export interface MarketEvent {
  id: string;
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  eventType: 'earnings' | 'economic' | 'geopolitical' | 'central_bank' | 'corporate' | 'other';
  timestamp: string;
  affectedMarkets: string[];
  sourceType: 'past' | 'upcoming';
}

export interface CryptocurrencyData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  rank: number;
  timestamp: string;
}

export interface CustomWatchlistItem {
  id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'commodity' | 'currency' | 'crypto';
  exchange: string;
  region: string;
  addedAt: string;
}

export interface OpportunityAlert {
  id: string;
  type: 'arbitrage' | 'investment';
  title: string;
  description: string;
  confidence: number;
  potentialReturn: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  markets: string[];
  timestamp: string;
}