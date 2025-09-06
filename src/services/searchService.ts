
export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: 'stock' | 'index' | 'commodity' | 'currency' | 'crypto';
  region: string;
}

export class SearchService {
  private static instance: SearchService;

  private constructor() {}

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  // Mock database of searchable symbols
  private searchData: SearchResult[] = [
    // US Market Indexes
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF', exchange: 'NYSE', type: 'index', region: 'US' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust', exchange: 'NASDAQ', type: 'index', region: 'US' },
    { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF', exchange: 'NYSE', type: 'index', region: 'US' },
    { symbol: 'IWM', name: 'iShares Russell 2000 ETF', exchange: 'NYSE', type: 'index', region: 'US' },
    
    // US Stocks
    { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', type: 'stock', region: 'US' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', type: 'stock', region: 'US' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', type: 'stock', region: 'US' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', type: 'stock', region: 'US' },
    { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', type: 'stock', region: 'US' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', type: 'stock', region: 'US' },
    { symbol: 'SEA', name: 'Sea Limited', exchange: 'NYSE', type: 'stock', region: 'US' },
    { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', type: 'stock', region: 'US' },
    { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ', type: 'stock', region: 'US' },
    { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', exchange: 'NASDAQ', type: 'stock', region: 'US' },
    { symbol: 'CRM', name: 'Salesforce Inc.', exchange: 'NYSE', type: 'stock', region: 'US' },
    { symbol: 'PYPL', name: 'PayPal Holdings Inc.', exchange: 'NASDAQ', type: 'stock', region: 'US' },
    { symbol: 'INTC', name: 'Intel Corporation', exchange: 'NASDAQ', type: 'stock', region: 'US' },
    { symbol: 'ORCL', name: 'Oracle Corporation', exchange: 'NYSE', type: 'stock', region: 'US' },
    { symbol: 'ADBE', name: 'Adobe Inc.', exchange: 'NASDAQ', type: 'stock', region: 'US' },
    
    // China Market Indexes
    { symbol: '000001.SS', name: 'Shanghai Composite Index', exchange: 'SSE', type: 'index', region: 'CN' },
    { symbol: '399001.SZ', name: 'Shenzhen Component Index', exchange: 'SZSE', type: 'index', region: 'CN' },
    { symbol: 'HSI', name: 'Hang Seng Index', exchange: 'HKEX', type: 'index', region: 'HK' },
    
    // China Stocks (ADRs)
    { symbol: 'BABA', name: 'Alibaba Group Holding Limited', exchange: 'NYSE', type: 'stock', region: 'CN' },
    { symbol: 'JD', name: 'JD.com Inc.', exchange: 'NASDAQ', type: 'stock', region: 'CN' },
    { symbol: 'BIDU', name: 'Baidu Inc.', exchange: 'NASDAQ', type: 'stock', region: 'CN' },
    { symbol: 'NIO', name: 'NIO Inc.', exchange: 'NYSE', type: 'stock', region: 'CN' },
    { symbol: 'PDD', name: 'PDD Holdings Inc.', exchange: 'NASDAQ', type: 'stock', region: 'CN' },
    
    // Hong Kong Stocks
    { symbol: '0700.HK', name: 'Tencent Holdings Limited', exchange: 'HKEX', type: 'stock', region: 'HK' },
    { symbol: '9988.HK', name: 'Alibaba Group Holding Limited', exchange: 'HKEX', type: 'stock', region: 'HK' },
    { symbol: '0005.HK', name: 'HSBC Holdings plc', exchange: 'HKEX', type: 'stock', region: 'HK' },
    { symbol: '0941.HK', name: 'China Mobile Limited', exchange: 'HKEX', type: 'stock', region: 'HK' },
    
    // Commodities
    { symbol: 'GLD', name: 'SPDR Gold Trust', exchange: 'NYSE', type: 'commodity', region: 'Global' },
    { symbol: 'SLV', name: 'iShares Silver Trust', exchange: 'NYSE', type: 'commodity', region: 'Global' },
    { symbol: 'USO', name: 'United States Oil Fund', exchange: 'NYSE', type: 'commodity', region: 'Global' },
    { symbol: 'DBA', name: 'Invesco DB Agriculture Fund', exchange: 'NYSE', type: 'commodity', region: 'Global' },
    { symbol: 'GOLD', name: 'Gold Spot Price', exchange: 'COMEX', type: 'commodity', region: 'Global' },
    { symbol: 'SILVER', name: 'Silver Spot Price', exchange: 'COMEX', type: 'commodity', region: 'Global' },
    { symbol: 'CRUDE', name: 'Crude Oil WTI', exchange: 'NYMEX', type: 'commodity', region: 'Global' },
    { symbol: 'WHEAT', name: 'Wheat Futures', exchange: 'CBOT', type: 'commodity', region: 'Global' },
    { symbol: 'CORN', name: 'Corn Futures', exchange: 'CBOT', type: 'commodity', region: 'Global' },
    { symbol: 'NATGAS', name: 'Natural Gas', exchange: 'NYMEX', type: 'commodity', region: 'Global' },
    
    // Currencies
    { symbol: 'EURUSD', name: 'Euro/US Dollar', exchange: 'FOREX', type: 'currency', region: 'Global' },
    { symbol: 'GBPUSD', name: 'British Pound/US Dollar', exchange: 'FOREX', type: 'currency', region: 'Global' },
    { symbol: 'USDJPY', name: 'US Dollar/Japanese Yen', exchange: 'FOREX', type: 'currency', region: 'Global' },
    { symbol: 'USDCNY', name: 'US Dollar/Chinese Yuan', exchange: 'FOREX', type: 'currency', region: 'Global' },
    { symbol: 'USDCHF', name: 'US Dollar/Swiss Franc', exchange: 'FOREX', type: 'currency', region: 'Global' },
    { symbol: 'AUDUSD', name: 'Australian Dollar/US Dollar', exchange: 'FOREX', type: 'currency', region: 'Global' },
    { symbol: 'USDCAD', name: 'US Dollar/Canadian Dollar', exchange: 'FOREX', type: 'currency', region: 'Global' },
    { symbol: 'NZDUSD', name: 'New Zealand Dollar/US Dollar', exchange: 'FOREX', type: 'currency', region: 'Global' },
    { symbol: 'EURGBP', name: 'Euro/British Pound', exchange: 'FOREX', type: 'currency', region: 'Global' },
    { symbol: 'EURJPY', name: 'Euro/Japanese Yen', exchange: 'FOREX', type: 'currency', region: 'Global' },
    { symbol: 'GBPJPY', name: 'British Pound/Japanese Yen', exchange: 'FOREX', type: 'currency', region: 'Global' },
    
    // Cryptocurrencies
    { symbol: 'BTC', name: 'Bitcoin', exchange: 'Crypto', type: 'crypto', region: 'Global' },
    { symbol: 'ETH', name: 'Ethereum', exchange: 'Crypto', type: 'crypto', region: 'Global' },
    { symbol: 'BNB', name: 'BNB', exchange: 'Crypto', type: 'crypto', region: 'Global' },
    { symbol: 'XRP', name: 'XRP', exchange: 'Crypto', type: 'crypto', region: 'Global' },
    { symbol: 'SOL', name: 'Solana', exchange: 'Crypto', type: 'crypto', region: 'Global' },
    { symbol: 'ADA', name: 'Cardano', exchange: 'Crypto', type: 'crypto', region: 'Global' },
    { symbol: 'AVAX', name: 'Avalanche', exchange: 'Crypto', type: 'crypto', region: 'Global' },
    { symbol: 'DOT', name: 'Polkadot', exchange: 'Crypto', type: 'crypto', region: 'Global' },
    { symbol: 'MATIC', name: 'Polygon', exchange: 'Crypto', type: 'crypto', region: 'Global' },
    { symbol: 'LTC', name: 'Litecoin', exchange: 'Crypto', type: 'crypto', region: 'Global' },
    { symbol: 'LINK', name: 'Chainlink', exchange: 'Crypto', type: 'crypto', region: 'Global' },
    { symbol: 'UNI', name: 'Uniswap', exchange: 'Crypto', type: 'crypto', region: 'Global' },
    { symbol: 'TRX', name: 'TRON', exchange: 'Crypto', type: 'crypto', region: 'Global' },
    { symbol: 'ATOM', name: 'Cosmos', exchange: 'Crypto', type: 'crypto', region: 'Global' },
    { symbol: 'ICP', name: 'Internet Computer', exchange: 'Crypto', type: 'crypto', region: 'Global' },
  ];

  async searchSymbols(query: string, limit: number = 10): Promise<SearchResult[]> {
    if (!query.trim()) return [];
    
    const searchQuery = query.toLowerCase().trim();
    
    const results = this.searchData
      .filter(item => 
        item.symbol.toLowerCase().includes(searchQuery) ||
        item.name.toLowerCase().includes(searchQuery)
      )
      .sort((a, b) => {
        // Prioritize exact symbol matches
        if (a.symbol.toLowerCase() === searchQuery) return -1;
        if (b.symbol.toLowerCase() === searchQuery) return 1;
        
        // Then symbol starts with query
        if (a.symbol.toLowerCase().startsWith(searchQuery)) return -1;
        if (b.symbol.toLowerCase().startsWith(searchQuery)) return 1;
        
        // Then name starts with query
        if (a.name.toLowerCase().startsWith(searchQuery)) return -1;
        if (b.name.toLowerCase().startsWith(searchQuery)) return 1;
        
        return a.symbol.localeCompare(b.symbol);
      })
      .slice(0, limit);
    
    // Simulate API delay
    return new Promise(resolve => {
      setTimeout(() => resolve(results), 200);
    });
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'stock': return '📈';
      case 'index': return '📊';
      case 'commodity': return '🏭';
      case 'currency': return '💱';
      default: return '📋';
    }
  }

  getRegionFlag(region: string): string {
    switch (region) {
      case 'US': return '🇺🇸';
      case 'CN': return '🇨🇳';
      case 'HK': return '🇭🇰';
      case 'Global': return '🌍';
      default: return '🏴';
    }
  }
}

export const searchService = SearchService.getInstance();