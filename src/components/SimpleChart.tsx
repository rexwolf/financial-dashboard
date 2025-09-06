import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Play, Pause, RefreshCw } from 'lucide-react';
import { ChartData } from '../types';

interface SimpleChartProps {
  data: ChartData[];
  symbol: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onRefresh?: () => void;
  className?: string;
}

const SimpleChart: React.FC<SimpleChartProps> = ({ 
  data, 
  symbol, 
  autoRefresh = true, 
  refreshInterval = 30000,
  onRefresh,
  className = '' 
}) => {
  const [isAutoRefresh, setIsAutoRefresh] = useState(autoRefresh);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
      setLastUpdate(new Date());
    }
  }, [onRefresh]);

  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isAutoRefresh, refreshInterval, handleRefresh]);

  // Simple SVG chart implementation
  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          No chart data available
        </div>
      );
    }

    const width = 800;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const prices = data.map(d => d.close);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * chartWidth;
      const y = chartHeight - ((d.close - minPrice) / priceRange) * chartHeight;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="100%" height="300" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((percent) => (
            <line
              key={percent}
              x1={0}
              y1={(percent / 100) * chartHeight}
              x2={chartWidth}
              y2={(percent / 100) * chartHeight}
              stroke="#f0f0f0"
              strokeDasharray="3,3"
            />
          ))}
          
          {/* Area fill */}
          <path
            d={`M 0,${chartHeight} L ${points} L ${chartWidth},${chartHeight} Z`}
            fill="url(#chartGradient)"
          />
          
          {/* Price line */}
          <polyline
            points={points}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
          />
          
          {/* Data points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * chartWidth;
            const y = chartHeight - ((d.close - minPrice) / priceRange) * chartHeight;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill="#3b82f6"
                className="opacity-0 hover:opacity-100 transition-opacity"
              />
            );
          })}
          
          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map((percent) => {
            const price = minPrice + (priceRange * percent / 100);
            const y = chartHeight - (percent / 100) * chartHeight;
            return (
              <text
                key={percent}
                x={-10}
                y={y}
                textAnchor="end"
                className="text-xs fill-gray-500"
                dominantBaseline="middle"
              >
                ${price.toFixed(2)}
              </text>
            );
          })}
          
          {/* X-axis labels */}
          {data.filter((_, i) => i % Math.ceil(data.length / 5) === 0).map((d, i, arr) => {
            const index = data.indexOf(d);
            const x = (index / (data.length - 1)) * chartWidth;
            const time = new Date(d.time).toLocaleTimeString('en-US', { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit' 
            });
            return (
              <text
                key={index}
                x={x}
                y={chartHeight + 20}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {time}
              </text>
            );
          })}
        </g>
      </svg>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{symbol}</h3>
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={`p-2 rounded-md transition-colors ${
              isAutoRefresh 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={isAutoRefresh ? 'Pause auto-refresh' : 'Start auto-refresh'}
          >
            {isAutoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>

          <button
            onClick={handleRefresh}
            className="p-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
            title="Refresh now"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button className="p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        {renderChart()}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>
          Auto-refresh: {isAutoRefresh ? 'ON' : 'OFF'} 
          {isAutoRefresh && ` (${refreshInterval / 1000}s)`}
        </span>
        <span>
          {data.length} data points
        </span>
      </div>
    </div>
  );
};

export default SimpleChart;