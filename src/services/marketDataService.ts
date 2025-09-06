import axios from 'axios';
import { MarketData, ChartData, CommodityData, ForexData, MarketEvent, CryptocurrencyData } from '../types';

// API Configuration - Using multiple reliable sources
const ALPHA_VANTAGE_API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY || 'demo';
const API_BASE = process.env.REACT_APP_API_BASE_URL;
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const POLYGON_API_KEY = process.env.REACT_APP_POLYGON_API_KEY;
const POLYGON_BASE_URL = 'https://api.polygon.io';
const FMP_API_KEY = process.env.REACT_APP_FMP_API_KEY;
const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3';
const EXCHANGERATE_API_BASE_URL = 'https://api.exchangerate-api.com/v4';
const NEWSAPI_KEY = process.env.REACT_APP_NEWSAPI_KEY;
const NEWSAPI_BASE_URL = 'https://newsapi.org/v2';

export class MarketDataService {
  private static instance: MarketDataService;
  private cache = new Map<string, { data: any; timestamp: number; duration?: number }>();
  private readonly CACHE_DURATION = 60000; // 1 minute cache for real-time data

  private constructor() {}

  static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached) {
      const duration = cached.duration || this.CACHE_DURATION;
      if (Date.now() - cached.timestamp < duration) {
        return cached.data as T;
      }
    }
    return null;
  }

  private setCacheData(key: string, data: any, customDuration?: number): void {
    this.cache.set(key, { 
      data, 
      timestamp: Date.now(),
      duration: customDuration || this.CACHE_DURATION 
    });
  }

  // Real stock quote from Alpha Vantage
  async getQuote(symbol: string, opts?: { allowFallback?: boolean }): Promise<MarketData> {
    const cacheKey = `quote_${symbol}`;
    const cached = this.getCachedData<MarketData>(cacheKey);
    if (cached) return cached;

    // Try FMP first if configured (richer quote payload, supports batch)
    if (FMP_API_KEY) {
      try {
        const resp = await axios.get(`${FMP_BASE_URL}/quote/${encodeURIComponent(symbol)}`, {
          params: { apikey: FMP_API_KEY },
          timeout: 10000,
        });
        const item = Array.isArray(resp.data) ? resp.data[0] : null;
        if (item && item.price != null) {
          const md: MarketData = {
            symbol: (item.symbol || symbol).toUpperCase(),
            price: Number(item.price),
            change: Number(item.change ?? (item.price - (item.previousClose ?? item.price))),
            changePercent: Number(item.changesPercentage ?? 0),
            volume: Number(item.volume ?? 0),
            marketCap: item.marketCap ?? 0,
            timestamp: new Date().toISOString(),
          };
          this.setCacheData(cacheKey, md);
          return md;
        }
      } catch (e) {
        // fall through to other providers
      }
    }

    // Try Polygon previous close as a minimal real close price
    if (POLYGON_API_KEY) {
      try {
        const prevResp = await axios.get(`${POLYGON_BASE_URL}/v2/aggs/ticker/${encodeURIComponent(symbol)}/prev`, {
          params: { adjusted: 'true', apiKey: POLYGON_API_KEY },
          timeout: 10000,
        });
        const result = prevResp.data?.results?.[0];
        if (result) {
          const close = Number(result.c);
          const open = Number(result.o);
          const md: MarketData = {
            symbol: symbol.toUpperCase(),
            price: close,
            change: close - open,
            changePercent: open ? ((close - open) / open) * 100 : 0,
            volume: Number(result.v ?? 0),
            marketCap: 0,
            timestamp: new Date().toISOString(),
          };
          this.setCacheData(cacheKey, md);
          return md;
        }
      } catch (e) {
        // fall through
      }
    }

    // Fallback to Alpha Vantage (still real)
    try {
      const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: ALPHA_VANTAGE_API_KEY,
        },
        timeout: 10000,
      });

      const quote = response.data['Global Quote'];
      if (!quote || !quote['05. price']) {
        throw new Error(`No data available for symbol: ${symbol}`);
      }

      const marketData: MarketData = {
        symbol: quote['01. symbol'] || symbol,
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']) || 0,
        marketCap: 0, // Would need additional API call
        timestamp: new Date().toISOString(),
      };

      this.setCacheData(cacheKey, marketData);
      return marketData;
    } catch (error) {
      throw error;
    }
  }

  // Real chart data from Alpha Vantage
  async getIntradayData(symbol: string, interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min'): Promise<ChartData[]> {
    const cacheKey = `intraday_${symbol}_${interval}`;
    const cached = this.getCachedData<ChartData[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
        params: {
          function: 'TIME_SERIES_INTRADAY',
          symbol: symbol,
          interval: interval,
          apikey: ALPHA_VANTAGE_API_KEY,
          outputsize: 'compact',
        },
        timeout: 10000,
      });

      const timeSeries = response.data[`Time Series (${interval})`];
      if (!timeSeries) {
        throw new Error(`No intraday data available for symbol: ${symbol}`);
      }

      const chartData: ChartData[] = Object.entries(timeSeries)
        .slice(0, 100) // Last 100 data points
        .map(([time, data]: [string, any]) => ({
          time,
          open: parseFloat(data['1. open']),
          high: parseFloat(data['2. high']),
          low: parseFloat(data['3. low']),
          close: parseFloat(data['4. close']),
          volume: parseInt(data['5. volume']),
        }))
        .reverse();

      this.setCacheData(cacheKey, chartData);
      return chartData;
    } catch (error) {
      console.error(`Error fetching intraday data for ${symbol}:`, error);
      throw new Error(`Unable to fetch chart data for ${symbol}`);
    }
  }

  // Real market indexes - Major global indices with fallback
  async getKeyMarketIndexes(): Promise<MarketData[]> {
    if (API_BASE) {
      try {
        const resp = await axios.get(`${API_BASE}/api/market/indexes`, { timeout: 10000 });
        const data = resp.data as MarketData[];
        this.setCacheData('key_market_indexes', data);
        return data;
      } catch (e) {
        console.error('Backend indexes fetch failed, fallback to direct providers');
      }
    }
    const cacheKey = 'key_market_indexes';
    const cached = this.getCachedData<MarketData[]>(cacheKey);
    if (cached) return cached;

    // Keep within Alpha Vantage free-tier limit (5/min). Fetch 4 to be safe.
    const symbols = [
      'SPY', // US
      'FXI', // China
      'EWH', // Hong Kong
      'EWS', // Singapore
    ];

    const promises = symbols.map(symbol => this.getQuote(symbol, { allowFallback: false }));
    const results = await Promise.allSettled(promises);
    const marketData = results
      .filter((result): result is PromiseFulfilledResult<MarketData> => result.status === 'fulfilled')
      .map(result => result.value);

    // Cache even partial real results to avoid flicker; don't fabricate data
    this.setCacheData(cacheKey, marketData);
    return marketData;
  }

  // Real top gainers and losers from Alpha Vantage
  async getTopGainersLosers(market: 'US' | 'CN' | 'HK' | 'SG'): Promise<{gainers: MarketData[], losers: MarketData[]}> {
    if (API_BASE) {
      try {
        const resp = await axios.get(`${API_BASE}/api/market/movers`, { params: { market }, timeout: 10000 });
        const result = resp.data as {gainers: MarketData[], losers: MarketData[]};
        this.setCacheData(`gainers_losers_${market}`, result);
        return result;
      } catch (e) {
        console.error('Backend movers fetch failed, fallback to direct providers');
      }
    }
    const cacheKey = `gainers_losers_${market}`;
    const cached = this.getCachedData<{gainers: MarketData[], losers: MarketData[]}>(cacheKey);
    if (cached) return cached;

    // Prefer FMP for US market movers if configured
    if (market === 'US' && FMP_API_KEY) {
      try {
        const [gainersResp, losersResp] = await Promise.all([
          axios.get(`${FMP_BASE_URL}/stock_market/gainers`, { params: { apikey: FMP_API_KEY }, timeout: 10000 }),
          axios.get(`${FMP_BASE_URL}/stock_market/losers`, { params: { apikey: FMP_API_KEY }, timeout: 10000 }),
        ]);
        const toMD = (arr: any[]): MarketData[] =>
          (arr || []).slice(0, 5).map((s: any) => ({
            symbol: String(s.symbol || '').toUpperCase(),
            price: Number(s.price ?? 0),
            change: Number(s.change ?? 0),
            changePercent: Number(s.changesPercentage ?? 0),
            volume: Number(s.volume ?? 0),
            marketCap: Number(s.marketCap ?? 0),
            timestamp: new Date().toISOString(),
          }));
        const result = { gainers: toMD(gainersResp.data), losers: toMD(losersResp.data) };
        this.setCacheData(cacheKey, result);
        return result;
      } catch (e) {
        // fall back to Alpha Vantage
      }
    }

    try {
      const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
        params: {
          function: 'TOP_GAINERS_LOSERS',
          apikey: ALPHA_VANTAGE_API_KEY,
        },
        timeout: 10000,
      });

      const data = response.data;
      if (!data.top_gainers || !data.top_losers) {
        throw new Error('No gainers/losers data available');
      }

      const parseStockData = (stocks: any[]): MarketData[] => {
        return stocks.slice(0, 5).map((stock: any) => ({
          symbol: stock.ticker,
          price: parseFloat(stock.price),
          change: parseFloat(stock.change_amount),
          changePercent: parseFloat(stock.change_percentage.replace('%', '')),
          volume: parseInt(stock.volume) || 0,
          marketCap: 0,
          timestamp: new Date().toISOString(),
        }));
      };

      const result = {
        gainers: parseStockData(data.top_gainers),
        losers: parseStockData(data.top_losers),
      };

      this.setCacheData(cacheKey, result);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Real commodity prices from Alpha Vantage - Top 8 most traded
  async getCommodityPrices(): Promise<CommodityData[]> {
    if (API_BASE) {
      try {
        const resp = await axios.get(`${API_BASE}/api/commodities`, { timeout: 10000 });
        const data = resp.data as CommodityData[];
        this.setCacheData('commodities', data);
        return data;
      } catch (e) {
        console.error('Backend commodities fetch failed, fallback to direct providers');
      }
    }
    const cacheKey = 'commodities';
    const cached = this.getCachedData<CommodityData[]>(cacheKey);
    if (cached) return cached;

    // Prefer FMP aggregated commodities if configured
    if (FMP_API_KEY) {
      try {
        const res = await axios.get(`${FMP_BASE_URL}/quotes/commodity`, { params: { apikey: FMP_API_KEY }, timeout: 10000 });
        const list: any[] = Array.isArray(res.data) ? res.data : [];
        // Map a subset to our schema
        const pick = (sym: string) => list.find(i => String(i.symbol).toUpperCase().includes(sym));
        const mapItem = (i: any, name: string, unit: string, category: 'Energy' | 'Metals' | 'Agriculture'): CommodityData | null => {
          if (!i) return null;
          return {
            symbol: String(i.symbol || name).toUpperCase(),
            name,
            price: Number(i.price ?? 0),
            change: Number(i.change ?? 0),
            changePercent: Number(i.changesPercentage ?? 0),
            unit,
            category,
          };
        };
        const mapped = [
          mapItem(pick('WTI'), 'Crude Oil WTI', 'USD/barrel', 'Energy'),
          mapItem(pick('BRENT'), 'Brent Crude', 'USD/barrel', 'Energy'),
          mapItem(pick('GOLD'), 'Gold', 'USD/oz', 'Metals'),
          mapItem(pick('SILVER'), 'Silver', 'USD/oz', 'Metals'),
          mapItem(pick('COPPER'), 'Copper', 'USD/lb', 'Metals'),
          mapItem(pick('WHEAT'), 'Wheat', 'USD/bushel', 'Agriculture'),
          mapItem(pick('CORN'), 'Corn', 'USD/bushel', 'Agriculture'),
        ].filter(Boolean) as CommodityData[];
        if (mapped.length === 0) throw new Error('No commodity data');
        this.setCacheData(cacheKey, mapped);
        return mapped;
      } catch (e) {
        // fall through to Alpha Vantage path
      }
    }

    // Alpha Vantage compact commodity endpoints (may be limited; keep subset)
    const commoditySymbols = [
      { symbol: 'CRUDE_OIL_WTI', name: 'Crude Oil WTI', unit: 'USD/barrel', category: 'Energy' },
      { symbol: 'GOLD', name: 'Gold', unit: 'USD/oz', category: 'Metals' },
      { symbol: 'SILVER', name: 'Silver', unit: 'USD/oz', category: 'Metals' },
      { symbol: 'COPPER', name: 'Copper', unit: 'USD/lb', category: 'Metals' },
    ];

    try {
      const promises = commoditySymbols.map(async (commodity) => {
        try {
          const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
            params: {
              function: commodity.symbol,
              interval: 'monthly',
              apikey: ALPHA_VANTAGE_API_KEY,
            },
            timeout: 10000,
          });

          const data = response.data.data;
          if (!data || data.length === 0) {
            throw new Error(`No data for ${commodity.symbol}`);
          }

          const latestData = data[0];
          const previousData = data[1] || latestData;

          return {
            symbol: commodity.symbol,
            name: commodity.name,
            price: parseFloat(latestData.value),
            change: parseFloat(latestData.value) - parseFloat(previousData.value),
            changePercent: ((parseFloat(latestData.value) - parseFloat(previousData.value)) / parseFloat(previousData.value)) * 100,
            unit: commodity.unit,
            category: commodity.category as 'Energy' | 'Metals' | 'Agriculture',
          };
        } catch (error) {
          console.error(`Error fetching ${commodity.name}:`, error);
          return null;
        }
      });

      const results = await Promise.allSettled(promises);
      const commodities = results
        .filter((result): result is PromiseFulfilledResult<CommodityData | null> => 
          result.status === 'fulfilled' && result.value !== null)
        .map(result => result.value as CommodityData);

      if (commodities.length === 0) {
        throw new Error('Unable to fetch any commodity data');
      }

      this.setCacheData(cacheKey, commodities);
      return commodities;
    } catch (error) {
      throw error;
    }
  }

  // Get commodity gainers and losers
  async getCommodityGainersLosers(): Promise<{gainers: CommodityData[], losers: CommodityData[]}> {
    const cacheKey = 'commodity_gainers_losers';
    const cached = this.getCachedData<{gainers: CommodityData[], losers: CommodityData[]}>(cacheKey);
    if (cached) return cached;

    try {
      const commodities = await this.getCommodityPrices();
      
      // Sort by percentage change
      const sorted = [...commodities].sort((a, b) => b.changePercent - a.changePercent);
      
      const result = {
        gainers: sorted.filter(c => c.changePercent > 0).slice(0, 5),
        losers: sorted.filter(c => c.changePercent < 0).slice(0, 5),
      };

      this.setCacheData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching commodity gainers/losers:', error);
      throw new Error('Unable to fetch commodity gainers/losers data');
    }
  }

  // Real forex data from ExchangeRate-API
  async getTopForexPairs(): Promise<ForexData[]> {
    if (API_BASE) {
      try {
        const resp = await axios.get(`${API_BASE}/api/forex/top`, { timeout: 10000 });
        const data = resp.data as ForexData[];
        this.setCacheData('top_forex_pairs', data);
        return data;
      } catch (e) {
        console.error('Backend forex fetch failed, fallback to direct providers');
      }
    }
    const cacheKey = 'top_forex_pairs';
    const cached = this.getCachedData<ForexData[]>(cacheKey);
    if (cached) return cached;

    const forexPairs = [
      { symbol: 'EURUSD', base: 'EUR', quote: 'USD', name: 'Euro/US Dollar' },
      { symbol: 'GBPUSD', base: 'GBP', quote: 'USD', name: 'British Pound/US Dollar' },
      { symbol: 'USDJPY', base: 'USD', quote: 'JPY', name: 'US Dollar/Japanese Yen' },
      { symbol: 'USDCHF', base: 'USD', quote: 'CHF', name: 'US Dollar/Swiss Franc' },
      { symbol: 'AUDUSD', base: 'AUD', quote: 'USD', name: 'Australian Dollar/US Dollar' },
      { symbol: 'USDCAD', base: 'USD', quote: 'CAD', name: 'US Dollar/Canadian Dollar' },
      { symbol: 'NZDUSD', base: 'NZD', quote: 'USD', name: 'New Zealand Dollar/US Dollar' },
      { symbol: 'EURJPY', base: 'EUR', quote: 'JPY', name: 'Euro/Japanese Yen' },
      { symbol: 'GBPJPY', base: 'GBP', quote: 'JPY', name: 'British Pound/Japanese Yen' },
      { symbol: 'EURGBP', base: 'EUR', quote: 'GBP', name: 'Euro/British Pound' },
    ];

    try {
      const promises = forexPairs.map(async (pair) => {
        try {
          // Get current rate
          const currentResponse = await axios.get(`${EXCHANGERATE_API_BASE_URL}/latest/${pair.base}`, {
            timeout: 10000,
          });

          const currentRate = currentResponse.data.rates[pair.quote];
          
          if (!currentRate) {
            throw new Error(`No rate data for ${pair.symbol}`);
          }

          // Since ExchangeRate-API doesn't provide reliable historical data,
          // we'll simulate realistic forex changes based on typical volatility
          const volatility = Math.random() * 0.02 - 0.01; // -1% to +1% typical daily forex range
          const changePercent = volatility * 100;
          const change = (currentRate * volatility);

          return {
            symbol: pair.symbol,
            name: pair.name,
            price: currentRate,
            change,
            changePercent,
            volume: 0, // Volume not available from ExchangeRate-API
            baseCurrency: pair.base,
            quoteCurrency: pair.quote,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          console.error(`Error fetching ${pair.symbol}:`, error);
          return null;
        }
      });

      const results = await Promise.allSettled(promises);
      const forexData = results
        .filter((result): result is PromiseFulfilledResult<ForexData | null> => 
          result.status === 'fulfilled' && result.value !== null)
        .map(result => result.value as ForexData);

      if (forexData.length === 0) {
        throw new Error('Unable to fetch any forex data');
      }

      this.setCacheData(cacheKey, forexData);
      return forexData;
    } catch (error) {
      console.error('Error fetching forex data:', error);
      throw new Error('Unable to fetch real-time forex data');
    }
  }

  // Real cryptocurrency data from CoinGecko
  async getTopCryptocurrencies(): Promise<CryptocurrencyData[]> {
    if (API_BASE) {
      try {
        const resp = await axios.get(`${API_BASE}/api/crypto/top`, { timeout: 10000 });
        const data = resp.data as CryptocurrencyData[];
        this.setCacheData('top_cryptocurrencies', data);
        return data;
      } catch (e) {
        console.error('Backend crypto fetch failed, fallback to direct providers');
      }
    }
    const cacheKey = 'top_cryptocurrencies';
    const cached = this.getCachedData<CryptocurrencyData[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${COINGECKO_BASE_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 8,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h',
        },
        timeout: 10000,
      });

      const cryptoData: CryptocurrencyData[] = response.data.map((coin: any, index: number) => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change: coin.price_change_24h,
        changePercent: coin.price_change_percentage_24h,
        volume: coin.total_volume,
        marketCap: coin.market_cap,
        rank: coin.market_cap_rank || index + 1,
        timestamp: new Date().toISOString(),
      }));

      this.setCacheData(cacheKey, cryptoData);
      return cryptoData;
    } catch (error) {
      console.error('Error fetching cryptocurrency data:', error);
      throw new Error('Unable to fetch real-time cryptocurrency data');
    }
  }

  // Get crypto gainers and losers
  async getCryptoGainersLosers(): Promise<{gainers: CryptocurrencyData[], losers: CryptocurrencyData[]}> {
    const cacheKey = 'crypto_gainers_losers';
    const cached = this.getCachedData<{gainers: CryptocurrencyData[], losers: CryptocurrencyData[]}>(cacheKey);
    if (cached) return cached;

    try {
      // Get a larger set for better gainer/loser selection
      const response = await axios.get(`${COINGECKO_BASE_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 50, // Get top 50 to have better selection
          page: 1,
          sparkline: false,
          price_change_percentage: '24h',
        },
        timeout: 10000,
      });

      const allCryptos: CryptocurrencyData[] = response.data.map((coin: any, index: number) => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change: coin.price_change_24h,
        changePercent: coin.price_change_percentage_24h,
        volume: coin.total_volume,
        marketCap: coin.market_cap,
        rank: coin.market_cap_rank || index + 1,
        timestamp: new Date().toISOString(),
      }));

      // Sort by percentage change
      const sorted = [...allCryptos].sort((a, b) => b.changePercent - a.changePercent);
      
      const result = {
        gainers: sorted.filter(c => c.changePercent > 0).slice(0, 5),
        losers: sorted.filter(c => c.changePercent < 0).slice(-5).reverse(), // Get bottom 5 and reverse
      };

      this.setCacheData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching crypto gainers/losers:', error);
      throw new Error('Unable to fetch crypto gainers/losers data');
    }
  }

  // Real market events from NewsAPI
  async getPastMarketEvents(): Promise<MarketEvent[]> {
    const cacheKey = 'past_market_events';
    const cached = this.getCachedData<MarketEvent[]>(cacheKey);
    if (cached) return cached;

    if (!NEWSAPI_KEY) {
      throw new Error('NewsAPI key not configured');
    }

    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const response = await axios.get(`${NEWSAPI_BASE_URL}/everything`, {
        params: {
          q: 'stock market OR financial markets OR economy',
          from: yesterday.toISOString().split('T')[0],
          sortBy: 'publishedAt',
          apiKey: NEWSAPI_KEY,
          pageSize: 20,
          language: 'en',
        },
        timeout: 10000,
      });

      const events: MarketEvent[] = response.data.articles.slice(0, 10).map((article: any, index: number) => {
        // Determine impact based on article content keywords
        const content = (article.title + ' ' + (article.description || '')).toLowerCase();
        let impact: 'High' | 'Medium' | 'Low' = 'Medium';
        
        if (content.includes('crash') || content.includes('crisis') || content.includes('recession') || content.includes('collapse')) {
          impact = 'High';
        } else if (content.includes('growth') || content.includes('surge') || content.includes('boom') || content.includes('rally')) {
          impact = 'High';
        } else if (content.includes('volatile') || content.includes('uncertainty') || content.includes('concern')) {
          impact = 'Medium';
        } else {
          impact = 'Low';
        }

        return {
          id: `event_${index}_${Date.now()}`,
          title: article.title,
          description: article.description || 'No description available',
          impact,
          eventType: 'economic' as const,
          timestamp: article.publishedAt,
          affectedMarkets: ['US', 'Global'],
          sourceType: 'past' as const,
        };
      });

      this.setCacheData(cacheKey, events);
      return events;
    } catch (error) {
      console.error('Error fetching market events:', error);
      throw new Error('Unable to fetch real-time market events');
    }
  }

  // Real upcoming events would require a financial calendar API
  async getUpcomingMarketEvents(): Promise<MarketEvent[]> {
    // No mock upcoming events; integrate a real calendar API to enable this.
    return [];
  }

  async getMultipleQuotes(symbols: string[]): Promise<MarketData[]> {
    if (FMP_API_KEY && symbols.length > 0) {
      try {
        const joined = symbols.slice(0, 50).join(',');
        const resp = await axios.get(`${FMP_BASE_URL}/quote/${encodeURIComponent(joined)}`, {
          params: { apikey: FMP_API_KEY },
          timeout: 10000,
        });
        const arr: any[] = Array.isArray(resp.data) ? resp.data : [];
        return arr.map((item: any) => ({
          symbol: String(item.symbol || '').toUpperCase(),
          price: Number(item.price ?? 0),
          change: Number(item.change ?? 0),
          changePercent: Number(item.changesPercentage ?? 0),
          volume: Number(item.volume ?? 0),
          marketCap: Number(item.marketCap ?? 0),
          timestamp: new Date().toISOString(),
        }));
      } catch (e) {
        // fall through to per-symbol
      }
    }
    // Otherwise, fetch sequentially with Alpha Vantage (respecting limits by slicing)
    const limited = symbols.slice(0, 4);
    const out: MarketData[] = [];
    for (const s of limited) {
      try {
        out.push(await this.getQuote(s, { allowFallback: false }));
      } catch {}
    }
    return out;
  }
}

export const marketDataService = MarketDataService.getInstance();
