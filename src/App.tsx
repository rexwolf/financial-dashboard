import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MarketCard from './components/MarketCard';
import OpportunityCard from './components/OpportunityCard';
import { marketDataService } from './services/marketDataService';
import { opportunityService } from './services/opportunityService';
import { storageService } from './services/storageService';
import { MarketHoursService } from './utils/marketHours';
import { MarketData, CommodityData, OpportunityAlert, ForexData, MarketEvent, CustomWatchlistItem, CryptocurrencyData } from './types';
import { TrendingUp, BarChart3, Zap, Clock, AlertTriangle, Plus, X } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  const [selectedSection, setSelectedSection] = useState(() => {
    return localStorage.getItem('selectedSection') || 'overview';
  });
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [commodityData, setCommodityData] = useState<CommodityData[]>([]);
  const [forexData, setForexData] = useState<ForexData[]>([]);
  const [cryptoData, setCryptoData] = useState<CryptocurrencyData[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityAlert[]>([]);
  const [pastEvents, setPastEvents] = useState<MarketEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<MarketEvent[]>([]);
  const [customStocks, setCustomStocks] = useState<CustomWatchlistItem[]>([]);
  const [customCommodities, setCustomCommodities] = useState<CustomWatchlistItem[]>([]);
  const [customForex, setCustomForex] = useState<CustomWatchlistItem[]>([]);
  const [customCrypto, setCustomCrypto] = useState<CustomWatchlistItem[]>([]);
  const [focusedItem, setFocusedItem] = useState<string | null>(null);
  
  // Watchlist data with real-time prices
  const [watchlistData, setWatchlistData] = useState<{
    stocks: Map<string, MarketData>;
    commodities: Map<string, CommodityData>;
    forex: Map<string, ForexData>;
    crypto: Map<string, CryptocurrencyData>;
  }>({
    stocks: new Map(),
    commodities: new Map(),
    forex: new Map(),
    crypto: new Map(),
  });
  const [loading, setLoading] = useState(false); // Don't show loading on initial load
  const [marketStatus, setMarketStatus] = useState(MarketHoursService.getAllMarketStatuses());
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [opportunityRefreshInterval, setOpportunityRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load cached data first, then refresh
  const loadCachedDataAndRefresh = useCallback(async () => {
    // Load cached data first (no loading screen)
    await loadCachedData();
    
    // Update market status
    setMarketStatus(MarketHoursService.getAllMarketStatuses());
    
    // Then refresh with real data
    const anyMarketOpen = MarketHoursService.isAnyMajorMarketOpen();
    
    if (anyMarketOpen) {
      await fetchFreshData();
      startAutoRefresh();
    } else {
      // Market closed - only refresh once
      await fetchFreshData();
    }
  }, []);

  const loadCachedData = async () => {
    try {
      // Load all cached data in parallel
      const [
        cachedMarkets,
        cachedForex,
        cachedCrypto,
        cachedCommodities,
        cachedPastEvents,
        cachedUpcomingEvents,
        cachedOpportunities,
        cachedStocks,
        cachedCommoditiesWL,
        cachedForexWL,
        cachedCryptoWL
      ] = await Promise.all([
        storageService.getMarketData('market_indexes'),
        storageService.getMarketData('forex_pairs'),
        storageService.getMarketData('cryptocurrencies'),
        storageService.getMarketData('commodities'),
        storageService.getMarketData('past_events'),
        storageService.getMarketData('upcoming_events'),
        storageService.getMarketData('opportunities'),
        storageService.getUserWatchlist('stocks'),
        storageService.getUserWatchlist('commodities'),
        storageService.getUserWatchlist('forex'),
        storageService.getUserWatchlist('crypto'),
      ]);

      // Set cached data if available
      if (cachedMarkets) setMarketData(cachedMarkets);
      if (cachedForex) setForexData(cachedForex);
      if (cachedCrypto) setCryptoData(cachedCrypto);
      if (cachedCommodities) setCommodityData(cachedCommodities);
      if (cachedPastEvents) setPastEvents(cachedPastEvents);
      if (cachedUpcomingEvents) setUpcomingEvents(cachedUpcomingEvents);
      if (cachedOpportunities) setOpportunities(cachedOpportunities);
      if (cachedStocks) setCustomStocks(cachedStocks);
      if (cachedCommoditiesWL) setCustomCommodities(cachedCommoditiesWL);
      if (cachedForexWL) setCustomForex(cachedForexWL);
      if (cachedCryptoWL) setCustomCrypto(cachedCryptoWL);
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  };

  const fetchFreshData = async () => {
    try {
      setLoading(true);
      
      // Phase 1 (non-Alpha or minimal Alpha): indexes (<=4 AV calls), forex (free), crypto (CoinGecko), news
      const [
        markets,
        forex, 
        crypto,
        pastMarketEvents,
        upcomingMarketEvents
      ] = await Promise.allSettled([
        marketDataService.getKeyMarketIndexes(),
        marketDataService.getTopForexPairs(),
        marketDataService.getTopCryptocurrencies(),
        marketDataService.getPastMarketEvents(),
        marketDataService.getUpcomingMarketEvents(),
      ]);

      // Set data and cache if successful
      if (markets.status === 'fulfilled') {
        setMarketData(markets.value);
        await storageService.storeMarketData('market_indexes', markets.value, 5 * 60 * 1000); // 5min cache
      } else {
        console.error('Error fetching market data:', markets.reason);
      }

      if (forex.status === 'fulfilled') {
        setForexData(forex.value);
        await storageService.storeMarketData('forex_pairs', forex.value, 5 * 60 * 1000);
      } else {
        console.error('Error fetching forex data:', forex.reason);
      }

      if (crypto.status === 'fulfilled') {
        setCryptoData(crypto.value);
        await storageService.storeMarketData('cryptocurrencies', crypto.value, 2 * 60 * 1000); // 2min cache
      } else {
        console.error('Error fetching crypto data:', crypto.reason);
      }

      if (pastMarketEvents.status === 'fulfilled') {
        setPastEvents(pastMarketEvents.value);
        await storageService.storeMarketData('past_events', pastMarketEvents.value, 30 * 60 * 1000); // 30min cache
      } else {
        console.error('Error fetching past events:', pastMarketEvents.reason);
      }

      if (upcomingMarketEvents.status === 'fulfilled') {
        setUpcomingEvents(upcomingMarketEvents.value);
        await storageService.storeMarketData('upcoming_events', upcomingMarketEvents.value, 60 * 60 * 1000); // 1hr cache
      } else {
        console.error('Error fetching upcoming events:', upcomingMarketEvents.reason);
      }

      // Phase 2: commodities (Alpha Vantage; limited set to stay under limits)
      try {
        const commodities = await marketDataService.getCommodityPrices();
        setCommodityData(commodities);
        await storageService.storeMarketData('commodities', commodities, 5 * 60 * 1000);
      } catch (e) {
        console.error('Error fetching commodity data:', e);
      }

    } catch (error) {
      console.error('Error fetching fresh data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch opportunities after core data to avoid extra Alpha calls during initial load
  useEffect(() => {
    const fetchOpps = async () => {
      try {
        const opps = await opportunityService.getOpportunities();
        setOpportunities(opps);
        await storageService.storeMarketData('opportunities', opps, 10 * 60 * 1000);
      } catch (e) {
        console.error('Error fetching opportunities data:', e);
      }
    };
    fetchOpps();
  }, []);

  const startAutoRefresh = useCallback(() => {
    // Clear existing interval
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    // Only refresh when markets are open
    const anyMarketOpen = MarketHoursService.isAnyMajorMarketOpen();
    if (anyMarketOpen) {
      const interval = setInterval(async () => {
        // Check if markets are still open
        const stillOpen = MarketHoursService.isAnyMajorMarketOpen();
        if (stillOpen) {
          await fetchFreshData();
          setMarketStatus(MarketHoursService.getAllMarketStatuses());
        } else {
          // Markets closed, stop auto-refresh
          if (refreshInterval) {
            clearInterval(refreshInterval);
            setRefreshInterval(null);
          }
        }
      }, 60000); // Refresh every 1 minute during market hours
      
      setRefreshInterval(interval);
    }
  }, [refreshInterval]);

  // Start separate auto-refresh for opportunities every 5 minutes
  const startOpportunityRefresh = useCallback(() => {
    // Clear existing interval
    if (opportunityRefreshInterval) {
      clearInterval(opportunityRefreshInterval);
    }

    const interval = setInterval(async () => {
      try {
        console.log('Refreshing opportunities...');
        const freshOpportunities = await opportunityService.getOpportunities();
        setOpportunities(freshOpportunities);
        await storageService.storeMarketData('opportunities', freshOpportunities, 5 * 60 * 1000); // 5min cache
      } catch (error) {
        console.error('Error refreshing opportunities:', error);
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes
    
    setOpportunityRefreshInterval(interval);
  }, [opportunityRefreshInterval]);

  // Start opportunity refresh on mount
  useEffect(() => {
    startOpportunityRefresh();
    
    // Cleanup on unmount
    return () => {
      if (opportunityRefreshInterval) {
        clearInterval(opportunityRefreshInterval);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchInitialData = async () => {
    await loadCachedDataAndRefresh();
  };

  // Fetch real-time data for watchlist items
  const fetchWatchlistData = useCallback(async () => {
    try {
      const newWatchlistData = {
        stocks: new Map<string, MarketData>(),
        commodities: new Map<string, CommodityData>(),
        forex: new Map<string, ForexData>(),
        crypto: new Map<string, CryptocurrencyData>(),
      };

      // Fetch stock data for watchlist
      if (customStocks.length > 0) {
        const stockSymbols = customStocks.map(stock => stock.symbol);
        try {
          const stockData = await marketDataService.getMultipleQuotes(stockSymbols);
          stockData.forEach(data => {
            newWatchlistData.stocks.set(data.symbol, data);
          });
        } catch (error) {
          console.error('Error fetching watchlist stock data:', error);
        }
      }

      // Fetch commodity data - use existing commodity data and map by symbol
      if (customCommodities.length > 0) {
        commodityData.forEach(commodity => {
          if (customCommodities.some(item => item.symbol === commodity.symbol)) {
            newWatchlistData.commodities.set(commodity.symbol, commodity);
          }
        });
      }

      // Fetch forex data - use existing forex data and map by symbol
      if (customForex.length > 0) {
        forexData.forEach(forex => {
          if (customForex.some(item => item.symbol === forex.symbol)) {
            newWatchlistData.forex.set(forex.symbol, forex);
          }
        });
      }

      // Fetch crypto data - use existing crypto data and map by symbol  
      if (customCrypto.length > 0) {
        cryptoData.forEach(crypto => {
          if (customCrypto.some(item => item.symbol === crypto.symbol)) {
            newWatchlistData.crypto.set(crypto.symbol, crypto);
          }
        });
      }

      setWatchlistData(newWatchlistData);
    } catch (error) {
      console.error('Error fetching watchlist data:', error);
    }
  }, [customStocks, customCommodities, customForex, customCrypto, commodityData, forexData, cryptoData]);

  // Update watchlist data whenever watchlist items or market data changes
  useEffect(() => {
    fetchWatchlistData();
  }, [fetchWatchlistData]);

  // Add item to appropriate watchlist
  const addToWatchlist = async (symbol: string, name: string, type: 'stock' | 'commodity' | 'currency' | 'crypto', exchange: string, region: string) => {
    const newItem: CustomWatchlistItem = {
      id: `${type}_${symbol}_${Date.now()}`,
      symbol,
      name,
      type,
      exchange,
      region,
      addedAt: new Date().toISOString(),
    };

    switch (type) {
      case 'stock':
        const newStocks = [newItem, ...customStocks];
        setCustomStocks(newStocks);
        await storageService.storeUserWatchlist('stocks', newStocks);
        break;
      case 'commodity':
        const newCommodities = [newItem, ...customCommodities];
        setCustomCommodities(newCommodities);
        await storageService.storeUserWatchlist('commodities', newCommodities);
        break;
      case 'currency':
        const newForex = [newItem, ...customForex];
        setCustomForex(newForex);
        await storageService.storeUserWatchlist('forex', newForex);
        break;
      case 'crypto':
        const newCrypto = [newItem, ...customCrypto];
        setCustomCrypto(newCrypto);
        await storageService.storeUserWatchlist('crypto', newCrypto);
        break;
    }
  };

  // Remove item from watchlist
  const removeFromWatchlist = async (id: string, type: 'stock' | 'commodity' | 'currency' | 'crypto') => {
    switch (type) {
      case 'stock':
        const newStocks = customStocks.filter(item => item.id !== id);
        setCustomStocks(newStocks);
        await storageService.storeUserWatchlist('stocks', newStocks);
        break;
      case 'commodity':
        const newCommodities = customCommodities.filter(item => item.id !== id);
        setCustomCommodities(newCommodities);
        await storageService.storeUserWatchlist('commodities', newCommodities);
        break;
      case 'currency':
        const newForex = customForex.filter(item => item.id !== id);
        setCustomForex(newForex);
        await storageService.storeUserWatchlist('forex', newForex);
        break;
      case 'crypto':
        const newCrypto = customCrypto.filter(item => item.id !== id);
        setCustomCrypto(newCrypto);
        await storageService.storeUserWatchlist('crypto', newCrypto);
        break;
    }
  };

  // Check if item is already in watchlist
  const isInWatchlist = (symbol: string, type: 'stock' | 'commodity' | 'currency' | 'crypto') => {
    switch (type) {
      case 'stock':
        return customStocks.some(item => item.symbol === symbol);
      case 'commodity':
        return customCommodities.some(item => item.symbol === symbol);
      case 'currency':
        return customForex.some(item => item.symbol === symbol);
      case 'crypto':
        return customCrypto.some(item => item.symbol === symbol);
      default:
        return false;
    }
  };

  const [gainersLosersData, setGainersLosersData] = useState<{
    US?: {gainers: MarketData[], losers: MarketData[]},
    CN?: {gainers: MarketData[], losers: MarketData[]},
    HK?: {gainers: MarketData[], losers: MarketData[]},
    SG?: {gainers: MarketData[], losers: MarketData[]}
  }>({});
  const [commodityGainersLosers, setCommodityGainersLosers] = useState<{
    gainers: CommodityData[],
    losers: CommodityData[]
  }>({gainers: [], losers: []});

  const [cryptoGainersLosers, setCryptoGainersLosers] = useState<{
    gainers: CryptocurrencyData[],
    losers: CryptocurrencyData[]
  }>({gainers: [], losers: []});

  useEffect(() => {
    const fetchMarketGainersLosers = async () => {
      try {
        const [usData, cnData, hkData, sgData, cryptoData] = await Promise.allSettled([
          marketDataService.getTopGainersLosers('US'),
          marketDataService.getTopGainersLosers('CN'),
          marketDataService.getTopGainersLosers('HK'),
          marketDataService.getTopGainersLosers('SG'),
          marketDataService.getCryptoGainersLosers(),
        ]);

        const newData: any = {};
        if (usData.status === 'fulfilled') newData.US = usData.value;
        if (cnData.status === 'fulfilled') newData.CN = cnData.value;
        if (hkData.status === 'fulfilled') newData.HK = hkData.value;
        if (sgData.status === 'fulfilled') newData.SG = sgData.value;
        setGainersLosersData(newData);

        if (cryptoData.status === 'fulfilled') setCryptoGainersLosers(cryptoData.value);
      } catch (error) {
        console.error('Error fetching gainers/losers:', error);
      }
    };
    fetchMarketGainersLosers();
  }, []);

  // Compute commodity gainers/losers from current commodityData (no extra API calls)
  useEffect(() => {
    if (!commodityData || commodityData.length === 0) return;
    const sorted = [...commodityData].sort((a, b) => b.changePercent - a.changePercent);
    setCommodityGainersLosers({
      gainers: sorted.filter(c => c.changePercent > 0).slice(0, 5),
      losers: sorted.filter(c => c.changePercent < 0).slice(0, 5),
    });
  }, [commodityData]);

  const renderOverview = () => {
    const usGainersLosers = gainersLosersData.US || { gainers: [], losers: [] };
    const cnGainersLosers = gainersLosersData.CN || { gainers: [], losers: [] };
    const hkGainersLosers = gainersLosersData.HK || { gainers: [], losers: [] };
    const sgGainersLosers = gainersLosersData.SG || { gainers: [], losers: [] };
    
    const totalVolume = marketData.reduce((sum, m) => sum + m.volume, 0);
    const avgChange = marketData.length > 0 ? marketData.reduce((sum, m) => sum + m.changePercent, 0) / marketData.length : 0;
    
    return (
      <div className="space-y-6">
        {/* Market Status Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Global Markets</p>
                <p className="text-2xl font-bold">{marketData.length}</p>
                <p className="text-xs text-blue-200 mt-1">Active Indexes</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Avg Performance</p>
                <p className="text-2xl font-bold">{avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%</p>
                <p className="text-xs text-green-200 mt-1">24h Change</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Total Volume</p>
                <p className="text-2xl font-bold">{(totalVolume / 1e9).toFixed(1)}B</p>
                <p className="text-xs text-purple-200 mt-1">24h Volume</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Opportunities</p>
                <p className="text-2xl font-bold">{opportunities.length}</p>
                <p className="text-xs text-orange-200 mt-1">Active Alerts</p>
              </div>
              <Zap className="h-8 w-8 text-orange-200" />
            </div>
          </div>
        </div>


        {/* Market Indexes Grid */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Market Indexes</h3>
          {(() => {
            const bySymbols = (symbols: string[]) => marketData.filter(m => symbols.includes(m.symbol.toUpperCase()));
            const sections = [
              { title: 'US', symbols: ['SPY','QQQ','DIA','IWM','VTI'] },
              { title: 'China', symbols: ['FXI','MCHI'] },
              { title: 'Hong Kong', symbols: ['EWH'] },
              { title: 'Singapore', symbols: ['EWS'] },
            ];
            return (
              <div className="space-y-6">
                {sections.map(section => {
                  const items = bySymbols(section.symbols);
                  if (items.length === 0) return null;
                  return (
                    <div key={section.title}>
                      <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">{section.title}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map(m => (<MarketCard key={m.symbol} data={m} />))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Top Gainers and Losers by Market */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* US Market */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-2">🇺🇸</span>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">US Market</h4>
            </div>
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Top Gainers (24h)
                </h5>
                <div className="space-y-2">
                  {usGainersLosers.gainers.slice(0, 3).map((stock, index) => (
                    <div key={stock.symbol} className="flex justify-between items-center text-sm" title={`${stock.symbol} – ${stock.price.toFixed(2)} (+${stock.changePercent.toFixed(2)}%)`}>
                      <span className="font-medium text-gray-900 dark:text-white">{stock.symbol}</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        +{stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1 rotate-180" />
                  Top Losers (24h)
                </h5>
                <div className="space-y-2">
                  {usGainersLosers.losers.slice(0, 3).map((stock, index) => (
                    <div key={stock.symbol} className="flex justify-between items-center text-sm" title={`${stock.symbol} – ${stock.price.toFixed(2)} (${stock.changePercent.toFixed(2)}%)`}>
                      <span className="font-medium text-gray-900 dark:text-white">{stock.symbol}</span>
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* China Market */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-2">🇨🇳</span>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">China Market</h4>
            </div>
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Top Gainers (24h)
                </h5>
                <div className="space-y-2">
                  {cnGainersLosers.gainers.slice(0, 3).map((stock, index) => (
                    <div key={stock.symbol} className="flex justify-between items-center text-sm" title={`${stock.symbol} – ${stock.price.toFixed(2)} (+${stock.changePercent.toFixed(2)}%)`}>
                      <span className="font-medium text-gray-900 dark:text-white">{stock.symbol}</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        +{stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1 rotate-180" />
                  Top Losers (24h)
                </h5>
                <div className="space-y-2">
                  {cnGainersLosers.losers.slice(0, 3).map((stock, index) => (
                    <div key={stock.symbol} className="flex justify-between items-center text-sm" title={`${stock.symbol} – ${stock.price.toFixed(2)} (${stock.changePercent.toFixed(2)}%)`}>
                      <span className="font-medium text-gray-900 dark:text-white">{stock.symbol}</span>
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Hong Kong Market */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-2">🇭🇰</span>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Hong Kong Market</h4>
            </div>
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Top Gainers (24h)
                </h5>
                <div className="space-y-2">
                  {hkGainersLosers.gainers.slice(0, 3).map((stock, index) => (
                    <div key={stock.symbol} className="flex justify-between items-center text-sm" title={`${stock.symbol} – ${stock.price.toFixed(2)} (+${stock.changePercent.toFixed(2)}%)`}>
                      <span className="font-medium text-gray-900 dark:text-white">{stock.symbol}</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        +{stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1 rotate-180" />
                  Top Losers (24h)
                </h5>
                <div className="space-y-2">
                  {hkGainersLosers.losers.slice(0, 3).map((stock, index) => (
                    <div key={stock.symbol} className="flex justify-between items-center text-sm" title={`${stock.symbol} – ${stock.price.toFixed(2)} (${stock.changePercent.toFixed(2)}%)`}>
                      <span className="font-medium text-gray-900 dark:text-white">{stock.symbol}</span>
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Commodities Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Commodities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {commodityData.map((commodity) => (
              <div key={commodity.symbol} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{commodity.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{commodity.symbol}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    commodity.changePercent >= 0 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                  }`}>
                    {commodity.changePercent >= 0 ? '+' : ''}{commodity.changePercent.toFixed(2)}%
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {commodity.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{commodity.unit}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Singapore Market */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-2">🇸🇬</span>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Singapore Market</h4>
            </div>
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Top Gainers (24h)
                </h5>
                <div className="space-y-2">
                {(gainersLosersData.SG?.gainers || []).slice(0, 3).map((stock) => (
                  <div key={stock.symbol} className="flex justify-between items-center text-sm" title={`${stock.symbol} – ${stock.price.toFixed(2)} (+${stock.changePercent.toFixed(2)}%)`}>
                    <span className="font-medium text-gray-900 dark:text-white">{stock.symbol}</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">+{stock.changePercent.toFixed(2)}%</span>
                  </div>
                ))}
                </div>
              </div>
              <div>
                <h5 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1 rotate-180" />
                  Top Losers (24h)
                </h5>
                <div className="space-y-2">
                {(gainersLosersData.SG?.losers || []).slice(0, 3).map((stock) => (
                  <div key={stock.symbol} className="flex justify-between items-center text-sm" title={`${stock.symbol} – ${stock.price.toFixed(2)} (${stock.changePercent.toFixed(2)}%)`}>
                    <span className="font-medium text-gray-900 dark:text-white">{stock.symbol}</span>
                    <span className="text-red-600 dark:text-red-400 font-medium">{stock.changePercent.toFixed(2)}%</span>
                  </div>
                ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading market data...</span>
        </div>
      );
    }

    switch (selectedSection) {
      case 'overview':
        return renderOverview();
      case 'markets':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Global Markets</h2>
            {(() => {
              const bySymbols = (symbols: string[]) => marketData.filter(m => symbols.includes(m.symbol.toUpperCase()));
              const sections = [
                { title: 'US', symbols: ['SPY','QQQ','DIA','IWM','VTI'] },
                { title: 'China', symbols: ['FXI','MCHI'] },
                { title: 'Hong Kong', symbols: ['EWH'] },
                { title: 'Singapore', symbols: ['EWS'] },
              ];
              return (
                <div className="space-y-6">
                  {sections.map(section => {
                    const items = bySymbols(section.symbols);
                    if (items.length === 0) return null;
                    return (
                      <div key={section.title}>
                        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">{section.title}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {items.map(m => (<MarketCard key={m.symbol} data={m} />))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Custom Stock Watchlist */}
            {customStocks.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                  My Stock Watchlist
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customStocks.map((stock) => (
                    <div key={stock.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 relative group" title={`${stock.symbol} – ${stock.name} (${stock.exchange})`}>
                      <button
                        onClick={() => removeFromWatchlist(stock.id, 'stock')}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white" title={stock.name}>{stock.symbol}</h4>
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                              {stock.exchange}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{stock.name}</p>
                        </div>
                        <div className="text-right">
                          {(() => {
                            const stockData = watchlistData.stocks.get(stock.symbol);
                            return stockData ? (
                              <>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">
                                  ${stockData.price.toFixed(2)}
                                </div>
                                <div className={`text-xs font-medium ${
                                  stockData.changePercent >= 0 
                                    ? 'text-green-600 dark:text-green-400' 
                                    : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {stockData.changePercent >= 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">--</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Loading...</div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 dark:text-gray-500">{stock.region}</span>
                        <span className="text-gray-400 dark:text-gray-500">
                          Added: {new Date(stock.addedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'commodities':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Commodities - Top 8 Most Traded</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {commodityData.map((commodity) => (
                <div key={commodity.symbol} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6" title={`${commodity.name} – ${commodity.category} (${commodity.unit})`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white" title={`${commodity.name} – ${commodity.category}`}>{commodity.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{commodity.category}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      commodity.changePercent >= 0 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                    }`}>
                      {commodity.changePercent >= 0 ? '+' : ''}{commodity.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {commodity.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{commodity.unit}</div>
                    <div className={`text-sm font-medium mt-1 ${
                      commodity.change >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {commodity.change >= 0 ? '+' : ''}{commodity.change.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Commodity Gainers and Losers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Gainers */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                  Top Commodity Gainers
                </h3>
                <div className="space-y-3">
                  {commodityGainersLosers.gainers.slice(0, 5).map((commodity, index) => (
                    <div key={commodity.symbol} className="flex justify-between items-center" title={`${commodity.name} – ${commodity.symbol} (${commodity.unit || ''}) +${commodity.changePercent.toFixed(2)}%`}>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{commodity.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{commodity.symbol}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-white">{commodity.price.toFixed(2)}</div>
                        <div className="text-green-600 dark:text-green-400 font-medium">
                          +{commodity.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                  {commodityGainersLosers.gainers.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                      No gainers data available
                    </div>
                  )}
                </div>
              </div>

              {/* Top Losers */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-red-500 rotate-180" />
                  Top Commodity Losers
                </h3>
                <div className="space-y-3">
                  {commodityGainersLosers.losers.slice(0, 5).map((commodity, index) => (
                    <div key={commodity.symbol} className="flex justify-between items-center" title={`${commodity.name} – ${commodity.symbol} (${commodity.unit || ''}) ${commodity.changePercent.toFixed(2)}%`}>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{commodity.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{commodity.symbol}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-white">{commodity.price.toFixed(2)}</div>
                        <div className="text-red-600 dark:text-red-400 font-medium">
                          {commodity.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                  {commodityGainersLosers.losers.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                      No losers data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Commodity Watchlist */}
            {customCommodities.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-orange-500" />
                  My Commodity Watchlist
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {customCommodities.map((commodity) => (
                    <div key={commodity.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 relative group" title={`${commodity.symbol} – ${commodity.name} (${commodity.exchange || commodity.region})`}>
                      <button
                        onClick={() => removeFromWatchlist(commodity.id, 'commodity')}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white" title={commodity.name}>{commodity.symbol}</h4>
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                              {commodity.exchange}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{commodity.name}</p>
                        </div>
                        <div className="text-right">
                          {(() => {
                            const commodityData = watchlistData.commodities.get(commodity.symbol);
                            return commodityData ? (
                              <>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">
                                  {commodityData.price.toFixed(2)}
                                </div>
                                <div className={`text-xs font-medium ${
                                  commodityData.changePercent >= 0 
                                    ? 'text-green-600 dark:text-green-400' 
                                    : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {commodityData.changePercent >= 0 ? '+' : ''}{commodityData.changePercent.toFixed(2)}%
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {commodityData.unit}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">--</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Loading...</div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 dark:text-gray-500">{commodity.region}</span>
                        <span className="text-gray-400 dark:text-gray-500">
                          Added: {new Date(commodity.addedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'forex':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Forex - Top 10 Most Traded Pairs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {forexData.map((pair) => (
                <div key={pair.symbol} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4" title={`${pair.name} – ${pair.baseCurrency}/${pair.quoteCurrency}`}> 
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white" title={`${pair.name}`}>{pair.symbol}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{pair.name}</p>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                        {pair.price.toFixed(5)}
                      </div>
                    </div>
                    
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      pair.changePercent >= 0 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                    }`}>
                      <span>
                        {pair.changePercent >= 0 ? '+' : ''}{pair.changePercent.toFixed(3)}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Change</span>
                      <div className={`font-medium ${pair.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {pair.change >= 0 ? '+' : ''}{pair.change.toFixed(5)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Volume</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {(pair.volume / 1e6).toFixed(0)}M
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Pair</span>
                      <div className="font-medium text-gray-900 dark:text-white text-xs">
                        {pair.baseCurrency}/{pair.quoteCurrency}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                    Last updated: {new Date(pair.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Forex Watchlist */}
            {customForex.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
                  My Forex Watchlist
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {customForex.map((forex) => (
                    <div key={forex.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 relative group" title={`${forex.symbol} – ${forex.name} (${forex.exchange || forex.region})`}>
                      <button
                        onClick={() => removeFromWatchlist(forex.id, 'currency')}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white" title={forex.name}>{forex.symbol}</h4>
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                              {forex.exchange}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{forex.name}</p>
                        </div>
                        <div className="text-right">
                          {(() => {
                            const forexData = watchlistData.forex.get(forex.symbol);
                            return forexData ? (
                              <>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">
                                  {forexData.price.toFixed(5)}
                                </div>
                                <div className={`text-xs font-medium ${
                                  forexData.changePercent >= 0 
                                    ? 'text-green-600 dark:text-green-400' 
                                    : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {forexData.changePercent >= 0 ? '+' : ''}{forexData.changePercent.toFixed(3)}%
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">--</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Loading...</div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 dark:text-gray-500">{forex.region}</span>
                        <span className="text-gray-400 dark:text-gray-500">
                          Added: {new Date(forex.addedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'crypto':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cryptocurrency - Top Traded Currencies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cryptoData.map((crypto) => (
                <div key={crypto.symbol} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{crypto.symbol}</h3>
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">#{crypto.rank}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{crypto.name}</p>
                    </div>
                    
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      crypto.changePercent >= 0 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                    }`}>
                      <span>
                        {crypto.changePercent >= 0 ? '+' : ''}{crypto.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${crypto.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: crypto.price < 1 ? 6 : 2 })}
                      </div>
                      <div className={`text-sm font-medium mt-1 ${
                        crypto.change >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {crypto.change >= 0 ? '+' : ''}${crypto.change.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: crypto.change < 1 ? 6 : 2 })}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Market Cap</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          ${(crypto.marketCap / 1e9).toFixed(1)}B
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">24h Volume</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          ${(crypto.volume / 1e6).toFixed(0)}M
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-700">
                      Last updated: {new Date(crypto.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Top Crypto Gainers and Losers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Gainers */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                  Top Crypto Gainers
                </h3>
                <div className="space-y-3">
                  {cryptoGainersLosers.gainers.map((crypto, index) => (
                    <div key={crypto.symbol} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-lg font-bold text-gray-700 dark:text-gray-300">#{index + 1}</div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white">{crypto.symbol}</h4>
                              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">#{crypto.rank}</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{crypto.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            ${crypto.price.toLocaleString('en-US', { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: crypto.price < 1 ? 6 : 2 
                            })}
                          </div>
                          <div className="flex items-center space-x-1 text-green-600 dark:text-green-400 font-medium">
                            <TrendingUp className="h-4 w-4" />
                            <span>+{crypto.changePercent.toFixed(2)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Losers */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                  Top Crypto Losers
                </h3>
                <div className="space-y-3">
                  {cryptoGainersLosers.losers.map((crypto, index) => (
                    <div key={crypto.symbol} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-lg font-bold text-gray-700 dark:text-gray-300">#{index + 1}</div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white">{crypto.symbol}</h4>
                              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">#{crypto.rank}</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{crypto.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            ${crypto.price.toLocaleString('en-US', { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: crypto.price < 1 ? 6 : 2 
                            })}
                          </div>
                          <div className="flex items-center space-x-1 text-red-600 dark:text-red-400 font-medium">
                            <AlertTriangle className="h-4 w-4" />
                            <span>{crypto.changePercent.toFixed(2)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Crypto Watchlist */}
            {customCrypto.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
                  My Crypto Watchlist
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {customCrypto.map((crypto) => (
                    <div key={crypto.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 relative group" title={`${crypto.symbol} – ${crypto.name} (${crypto.exchange || crypto.region})`}>
                      <button
                        onClick={() => removeFromWatchlist(crypto.id, 'crypto')}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white" title={crypto.name}>{crypto.symbol}</h4>
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                              {crypto.exchange}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{crypto.name}</p>
                        </div>
                        <div className="text-right">
                          {(() => {
                            const cryptoData = watchlistData.crypto.get(crypto.symbol);
                            return cryptoData ? (
                              <>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">
                                  ${cryptoData.price.toLocaleString('en-US', {
                                    minimumFractionDigits: cryptoData.price >= 1 ? 2 : 4,
                                    maximumFractionDigits: cryptoData.price >= 1 ? 2 : 4,
                                  })}
                                </div>
                                <div className={`text-xs font-medium ${
                                  cryptoData.changePercent >= 0 
                                    ? 'text-green-600 dark:text-green-400' 
                                    : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {cryptoData.changePercent >= 0 ? '+' : ''}{cryptoData.changePercent.toFixed(2)}%
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  #{cryptoData.rank}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">--</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Loading...</div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 dark:text-gray-500">{crypto.region}</span>
                        <span className="text-gray-400 dark:text-gray-500">
                          Added: {new Date(crypto.addedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'opportunities':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Zap className="h-6 w-6 mr-2 text-yellow-500" />
                Investment Opportunities
              </h2>
              <div className="flex space-x-2">
                <select className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option value="all">All Types</option>
                  <option value="arbitrage">Arbitrage</option>
                  <option value="investment">Investment</option>
                </select>
                <select className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option value="all">All Risk Levels</option>
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opportunities.map((opportunity) => (
                <OpportunityCard 
                  key={opportunity.id} 
                  opportunity={opportunity}
                  onClick={() => console.log('Clicked opportunity:', opportunity.id)}
                />
              ))}
            </div>
          </div>
        );
      case 'alerts':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Market Events & Alerts</h2>
            
            {/* Past 24 Hours Events */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                Past 24 Hours - Key Market Events
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {pastEvents.map((event) => (
                  <div key={event.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{event.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{event.description}</p>
                      </div>
                      
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ml-3 ${
                        event.impact === 'High' 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' 
                          : event.impact === 'Medium'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                      }`}>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {event.impact}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Event Type</span>
                        <span className="font-medium text-gray-900 dark:text-white capitalize">
                          {event.eventType.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Affected Markets</span>
                        <div className="flex flex-wrap gap-1 max-w-48">
                          {event.affectedMarkets.map((market, index) => (
                            <span key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs">
                              {market}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Time</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                Upcoming Events - Market Calendar
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 border-l-4 border-l-orange-400">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{event.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{event.description}</p>
                      </div>
                      
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ml-3 ${
                        event.impact === 'High' 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' 
                          : event.impact === 'Medium'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                      }`}>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {event.impact}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Event Type</span>
                        <span className="font-medium text-gray-900 dark:text-white capitalize">
                          {event.eventType.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Affected Markets</span>
                        <div className="flex flex-wrap gap-1 max-w-48">
                          {event.affectedMarkets.map((market, index) => (
                            <span key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs">
                              {market}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Scheduled Time</span>
                        <span className="font-medium text-orange-600 dark:text-orange-400">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">Coming Soon</h3>
              <p className="text-gray-500 mt-1">This section is under development.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <Header 
            onAddToWatchlist={addToWatchlist} 
            marketStatus={{
              us: marketStatus[0],
              china: marketStatus[1],
              hongKong: marketStatus[2]
            }} 
          />
          <div className="flex">
            <Sidebar selectedSection={selectedSection} onSectionChange={setSelectedSection} />
            <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 transition-colors">
              {renderContent()}
            </main>
          </div>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
