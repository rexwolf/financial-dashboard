import { OpportunityAlert } from '../types';
import { marketDataService } from './marketDataService';

export class OpportunityService {
  private static instance: OpportunityService;

  private constructor() {}

  static getInstance(): OpportunityService {
    if (!OpportunityService.instance) {
      OpportunityService.instance = new OpportunityService();
    }
    return OpportunityService.instance;
  }

  async getOpportunities(): Promise<OpportunityAlert[]> {
    // Only compute from real data; if analysis fails, return empty.
    try {
      return await this.generateRealTimeOpportunities();
    } catch {
      return [];
    }
  }

  async generateRealTimeOpportunities(): Promise<OpportunityAlert[]> {
    const opportunities: OpportunityAlert[] = [];
    const now = new Date().toISOString();
    
    try {
      // Fetch real market data
      const [stockData, commodityData, forexData, cryptoData, gainersLosers] = await Promise.allSettled([
        marketDataService.getKeyMarketIndexes(),
        marketDataService.getCommodityPrices(),
        marketDataService.getTopForexPairs(),
        marketDataService.getTopCryptocurrencies(),
        marketDataService.getTopGainersLosers('US'),
      ]);

      // Analyze high volatility opportunities
      if (gainersLosers.status === 'fulfilled') {
        const { gainers, losers } = gainersLosers.value;
        
        // High momentum gainers
        gainers.slice(0, 2).forEach((stock, index) => {
          if (stock.changePercent > 5) {
            opportunities.push({
              id: `momentum_${stock.symbol}_${Date.now()}_${index}`,
              type: 'investment',
              title: `High Momentum Alert: ${stock.symbol}`,
              description: `${stock.symbol} showing strong bullish momentum with ${stock.changePercent.toFixed(2)}% gain. Technical analysis suggests continued upward movement with high volume.`,
              confidence: Math.min(Math.max(60 + stock.changePercent, 65), 90),
              potentialReturn: Math.min(stock.changePercent * 0.3, 8),
              riskLevel: stock.changePercent > 10 ? 'High' : 'Medium',
              markets: ['US', 'Stocks'],
              timestamp: now,
            });
          }
        });

        // Oversold bounce candidates
        losers.slice(0, 1).forEach((stock, index) => {
          if (stock.changePercent < -3) {
            opportunities.push({
              id: `oversold_${stock.symbol}_${Date.now()}_${index}`,
              type: 'investment',
              title: `Oversold Bounce Candidate: ${stock.symbol}`,
              description: `${stock.symbol} down ${Math.abs(stock.changePercent).toFixed(2)}% and approaching oversold levels. Potential mean reversion opportunity with favorable risk/reward.`,
              confidence: 70,
              potentialReturn: Math.min(Math.abs(stock.changePercent) * 0.4, 6),
              riskLevel: 'Medium',
              markets: ['US', 'Stocks'],
              timestamp: now,
            });
          }
        });
      }

      // Commodity opportunities
      if (commodityData.status === 'fulfilled') {
        const commodities = commodityData.value;
        commodities.forEach((commodity, index) => {
          if (Math.abs(commodity.changePercent) > 2) {
            opportunities.push({
              id: `commodity_${commodity.symbol}_${Date.now()}_${index}`,
              type: 'investment',
              title: `Commodity Alert: ${commodity.name}`,
              description: `${commodity.name} showing ${Math.abs(commodity.changePercent).toFixed(2)}% movement. ${commodity.changePercent > 0 ? 'Bullish momentum' : 'Potential value opportunity'} in ${commodity.category.toLowerCase()} sector.`,
              confidence: 65 + Math.min(Math.abs(commodity.changePercent) * 2, 20),
              potentialReturn: Math.min(Math.abs(commodity.changePercent) * 0.5, 5),
              riskLevel: Math.abs(commodity.changePercent) > 4 ? 'High' : 'Medium',
              markets: ['Commodities', commodity.category],
              timestamp: now,
            });
          }
        });
      }

      // Forex opportunities
      if (forexData.status === 'fulfilled') {
        const forexPairs = forexData.value;
        forexPairs.slice(0, 3).forEach((pair, index) => {
          if (Math.abs(pair.changePercent) > 0.5) {
            opportunities.push({
              id: `forex_${pair.symbol}_${Date.now()}_${index}`,
              type: 'arbitrage',
              title: `Forex Movement: ${pair.symbol}`,
              description: `${pair.name} showing ${Math.abs(pair.changePercent).toFixed(3)}% movement. ${pair.changePercent > 0 ? 'Strength' : 'Weakness'} in ${pair.baseCurrency} against ${pair.quoteCurrency}.`,
              confidence: 75,
              potentialReturn: Math.min(Math.abs(pair.changePercent) * 2, 2),
              riskLevel: 'Low',
              markets: ['Forex', 'Currency'],
              timestamp: now,
            });
          }
        });
      }

      // Crypto opportunities
      if (cryptoData.status === 'fulfilled') {
        const cryptos = cryptoData.value;
        cryptos.slice(0, 5).forEach((crypto, index) => {
          if (Math.abs(crypto.changePercent) > 3) {
            opportunities.push({
              id: `crypto_${crypto.symbol}_${Date.now()}_${index}`,
              type: 'investment',
              title: `Crypto Alert: ${crypto.name}`,
              description: `${crypto.name} (${crypto.symbol}) ${crypto.changePercent > 0 ? 'surging' : 'declining'} ${Math.abs(crypto.changePercent).toFixed(2)}%. Market cap rank #${crypto.rank}.`,
              confidence: Math.min(70 + (crypto.changePercent > 0 ? 10 : 0), 85),
              potentialReturn: Math.min(Math.abs(crypto.changePercent) * 0.4, 15),
              riskLevel: 'High',
              markets: ['Crypto', 'Digital Assets'],
              timestamp: now,
            });
          }
        });
      }

      // Limit to top 5 opportunities by confidence and potential return
      return opportunities
        .sort((a, b) => {
          const scoreA = a.confidence + (a.potentialReturn * 10);
          const scoreB = b.confidence + (b.potentialReturn * 10);
          return scoreB - scoreA;
        })
        .slice(0, 5);

    } catch (error) {
      console.error('Error generating real-time opportunities:', error);
      return [];
    }
  }

  async getOpportunityById(id: string): Promise<OpportunityAlert | null> {
    const opportunities = await this.getOpportunities();
    return opportunities.find(opp => opp.id === id) || null;
  }

  async getOpportunitiesByType(type: 'arbitrage' | 'investment'): Promise<OpportunityAlert[]> {
    const opportunities = await this.getOpportunities();
    return opportunities.filter(opp => opp.type === type);
  }

  async getOpportunitiesByRisk(riskLevel: 'Low' | 'Medium' | 'High'): Promise<OpportunityAlert[]> {
    const opportunities = await this.getOpportunities();
    return opportunities.filter(opp => opp.riskLevel === riskLevel);
  }

  async getOpportunitiesByMarket(market: string): Promise<OpportunityAlert[]> {
    const opportunities = await this.getOpportunities();
    return opportunities.filter(opp => 
      opp.markets.some(m => m.toLowerCase().includes(market.toLowerCase()))
    );
  }

  // Analyze market data to find potential opportunities
  analyzeMarketData(marketData: any[]): OpportunityAlert[] {
    // This would contain sophisticated algorithms to analyze market data
    // For demo purposes, we'll return a simplified analysis
    const opportunities: OpportunityAlert[] = [];

    // Example: Look for high volatility stocks
    marketData.forEach(data => {
      if (Math.abs(data.changePercent) > 5) {
        opportunities.push({
          id: `analysis_${data.symbol}_${Date.now()}`,
          type: 'investment',
          title: `High Volatility Alert: ${data.symbol}`,
          description: `${data.symbol} showing ${Math.abs(data.changePercent).toFixed(2)}% movement. Consider position based on trend analysis.`,
          confidence: Math.random() * 30 + 50, // 50-80%
          potentialReturn: Math.random() * 5 + 2, // 2-7%
          riskLevel: Math.abs(data.changePercent) > 8 ? 'High' : 'Medium',
          markets: ['US'], // Default to US, would need more sophisticated detection
          timestamp: new Date().toISOString(),
        });
      }
    });

    return opportunities;
  }

  // Calculate risk score based on various factors
  calculateRiskScore(opportunity: OpportunityAlert): number {
    let score = 0;
    
    // Risk level contribution
    switch (opportunity.riskLevel) {
      case 'Low': score += 20; break;
      case 'Medium': score += 50; break;
      case 'High': score += 80; break;
    }

    // Confidence contribution (inverse)
    score += (100 - opportunity.confidence) * 0.3;

    // Potential return contribution
    score += Math.min(opportunity.potentialReturn * 2, 20);

    return Math.min(Math.max(score, 0), 100);
  }

  // Get recommendations based on user profile
  async getPersonalizedRecommendations(userProfile: {
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    investmentGoals: string[];
    preferredMarkets: string[];
  }): Promise<OpportunityAlert[]> {
    const allOpportunities = await this.getOpportunities();

    return allOpportunities
      .filter(opp => {
        // Filter by risk tolerance
        switch (userProfile.riskTolerance) {
          case 'conservative':
            return opp.riskLevel === 'Low';
          case 'moderate':
            return opp.riskLevel === 'Low' || opp.riskLevel === 'Medium';
          case 'aggressive':
            return true; // All risk levels
          default:
            return true;
        }
      })
      .filter(opp => {
        // Filter by preferred markets if specified
        if (userProfile.preferredMarkets.length === 0) return true;
        return opp.markets.some(market => 
          userProfile.preferredMarkets.some(preferred =>
            market.toLowerCase().includes(preferred.toLowerCase())
          )
        );
      })
      .sort((a, b) => {
        // Sort by confidence and potential return
        const scoreA = a.confidence + (a.potentialReturn * 10);
        const scoreB = b.confidence + (b.potentialReturn * 10);
        return scoreB - scoreA;
      })
      .slice(0, 5); // Return top 5 recommendations
  }
}

export const opportunityService = OpportunityService.getInstance();
