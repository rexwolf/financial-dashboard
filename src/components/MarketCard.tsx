import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { MarketData } from '../types';

interface MarketCardProps {
  data: MarketData;
  className?: string;
}

const MarketCard: React.FC<MarketCardProps> = ({ data, className = '' }) => {
  const isPositive = data.change >= 0;
  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap) return 'N/A';
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(1)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(1)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(1)}M`;
    return `$${formatNumber(marketCap)}`;
  };

  const instrumentDescriptions: Record<string, string> = {
    SPY: 'SPDR S&P 500 ETF – tracks the S&P 500 (US large-cap).',
    QQQ: 'Invesco QQQ – tracks the Nasdaq-100 (US tech-focused).',
    DIA: 'SPDR Dow Jones Industrial Average ETF – tracks the Dow 30.',
    IWM: 'iShares Russell 2000 – tracks US small-cap equities.',
    VTI: 'Vanguard Total Stock Market – broad US equity market.',
    MCHI: 'iShares MSCI China – tracks large & mid-cap China equities.',
    FXI: 'iShares China Large-Cap – tracks large-cap China equities.',
    EWH: 'iShares MSCI Hong Kong – tracks Hong Kong equities.',
    EWS: 'iShares MSCI Singapore – tracks Singapore equities.',
  };

  const getTooltip = () => {
    const key = (data.symbol || '').toUpperCase();
    const mapped = instrumentDescriptions[key];
    if (mapped) return mapped;
    if (data.name) return `${data.symbol} – ${data.name}`;
    return data.symbol;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white" title={getTooltip()}>{data.symbol}</h3>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            ${formatNumber(data.price)}
          </div>
        </div>
        
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${
          isPositive 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
        }`}>
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span>
            {isPositive ? '+' : ''}{formatNumber(data.changePercent, 2)}%
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Change</span>
          <div className={`font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isPositive ? '+' : ''}${formatNumber(data.change)}
          </div>
        </div>
        
        <div>
          <span className="text-gray-500 dark:text-gray-400">Volume</span>
          <div className="font-medium text-gray-900 dark:text-white">
            {(data.volume / 1e6).toFixed(1)}M
          </div>
        </div>

        {data.marketCap && (
          <div className="col-span-2">
            <span className="text-gray-500 dark:text-gray-400">Market Cap</span>
            <div className="font-medium text-gray-900 dark:text-white">
              {formatMarketCap(data.marketCap)}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
        Last updated: {new Date(data.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default MarketCard;
