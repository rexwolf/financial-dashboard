import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Settings, Play, Pause, RefreshCw } from 'lucide-react';
import { ChartData } from '../types';

interface TradingChartProps {
  data: ChartData[];
  symbol: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onRefresh?: () => void;
  className?: string;
}

const TradingChart: React.FC<TradingChartProps> = ({ 
  data, 
  symbol, 
  autoRefresh = true, 
  refreshInterval = 30000,
  onRefresh,
  className = '' 
}) => {
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
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


  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Open:</span>
              <span className="font-medium">${data.open.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">High:</span>
              <span className="font-medium text-green-600">${data.high.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Low:</span>
              <span className="font-medium text-red-600">${data.low.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Close:</span>
              <span className="font-medium">${data.close.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Volume:</span>
              <span className="font-medium">{(data.volume / 1e6).toFixed(1)}M</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const chartData = data.map(item => ({
    ...item,
    time: new Date(item.time).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }));

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
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as 'line' | 'area')}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="area">Area Chart</option>
            <option value="line">Line Chart</option>
          </select>

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

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                domain={['dataMin - 1', 'dataMax + 1']}
              />
              <Tooltip content={customTooltip} />
              <Area
                type="monotone"
                dataKey="close"
                stroke="#3b82f6"
                fill="url(#colorGradient)"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                domain={['dataMin - 1', 'dataMax + 1']}
              />
              <Tooltip content={customTooltip} />
              <Line
                type="monotone"
                dataKey="close"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#3b82f6' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>
          Auto-refresh: {isAutoRefresh ? 'ON' : 'OFF'} 
          {isAutoRefresh && ` (${refreshInterval / 1000}s)`}
        </span>
        <span>
          {chartData.length} data points
        </span>
      </div>
    </div>
  );
};

export default TradingChart;