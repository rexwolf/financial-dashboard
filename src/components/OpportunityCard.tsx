import React from 'react';
import { TrendingUp, AlertTriangle, Target, Clock } from 'lucide-react';
import { OpportunityAlert } from '../types';

interface OpportunityCardProps {
  opportunity: OpportunityAlert;
  onClick?: () => void;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, onClick }) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-800 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'Medium': return 'text-yellow-800 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'High': return 'text-red-800 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-800 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'arbitrage': return <TrendingUp className="h-4 w-4" />;
      case 'investment': return <Target className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 dark:text-green-400';
    if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${opportunity.type === 'arbitrage' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'}`}>
            {getTypeIcon(opportunity.type)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white capitalize" title={`Type: ${opportunity.type}`}>{opportunity.type}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(opportunity.timestamp).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end space-y-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(opportunity.riskLevel)}`}>
            {opportunity.riskLevel} Risk
          </span>
          <div className={`text-sm font-semibold ${getConfidenceColor(opportunity.confidence)}`}>
            {opportunity.confidence}% confidence
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2" title={opportunity.title}>{opportunity.title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{opportunity.description}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Potential Return:</span>
            <span className="font-semibold text-green-600 dark:text-green-400 ml-1">
              +{opportunity.potentialReturn.toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="h-3 w-3" />
          <span>
            {Math.floor((Date.now() - new Date(opportunity.timestamp).getTime()) / (1000 * 60))}m ago
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap gap-1">
          {opportunity.markets.map((market) => (
            <span 
              key={market}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
            >
              {market}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;
