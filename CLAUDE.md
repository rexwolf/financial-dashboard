# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start Development Server**
```bash
npm start
```
Launches at http://localhost:3000 with hot reloading.

**Build for Production** 
```bash
npm run build
```
Creates optimized build in `build/` directory.

**Run Tests**
```bash
npm test
```
Runs Jest test suite in interactive watch mode.

**TypeScript Compilation Check**
```bash
npx tsc --noEmit
```
Validates TypeScript without emitting files - essential before commits.

## Architecture Overview

### Service Layer Pattern
The application uses a service layer architecture with singleton services that manage data fetching, caching, and API interactions:

- **MarketDataService**: Central service handling all financial data APIs (Alpha Vantage, CoinGecko, ExchangeRate-API, NewsAPI) with intelligent fallback system for API rate limits
- **OpportunityService**: Generates investment opportunities and arbitrage alerts
- **StorageService**: Manages localStorage persistence for watchlists and user preferences
- **SearchService**: Handles asset search functionality across multiple asset types

### API Integration & Fallback System
The application integrates with multiple financial APIs and includes comprehensive fallback data to handle API rate limits:

**Primary APIs:**
- Alpha Vantage (stocks, commodities, market indexes) - 25 requests/day limit on free tier
- CoinGecko (cryptocurrency data) - reliable, no key required  
- ExchangeRate-API (forex rates) - reliable, no key required
- NewsAPI (market events) - requires key

**Fallback Strategy:**
When APIs hit rate limits, the service layer automatically serves realistic fallback data with proper caching (5-minute cache for fallbacks vs 1-minute for real data). This ensures the dashboard always displays meaningful data.

### Data Flow Architecture
1. **App.tsx** orchestrates all data fetching through service calls
2. **Services** handle API calls, caching, and error handling with fallbacks
3. **Context Providers** (Theme, Language) manage global UI state
4. **Components** receive data via props and focus on presentation
5. **Types** provide strict TypeScript interfaces for all data structures

### Component Architecture
```
src/
├── components/           # Presentation components
│   ├── Header.tsx       # Search, theme toggle, market status
│   ├── Sidebar.tsx      # Navigation with section switching  
│   ├── MarketCard.tsx   # Displays individual stock/commodity data
│   ├── TradingChart.tsx # Recharts integration with real-time updates
│   ├── OpportunityCard.tsx # Investment opportunity display
│   └── SimpleChart.tsx  # Basic chart component
├── contexts/            # React Context providers
│   ├── ThemeContext.tsx # Dark/light theme management
│   └LanguageContext.tsx # Multi-language support (EN/ZH)
├── services/            # Business logic and API integration
│   ├── marketDataService.ts # Core financial data service
│   ├── opportunityService.ts # Investment analysis
│   ├── storageService.ts # localStorage management
│   └── searchService.ts # Asset search functionality
├── types/               # TypeScript definitions
│   └── index.ts        # All interfaces (MarketData, CommodityData, etc.)
├── utils/               # Utility functions  
│   └── marketHours.ts  # Market status and hours calculation
└── App.tsx             # Main application orchestration
```

## Key Development Patterns

### Environment Configuration
API keys are managed through `.env` files (see `.env.example`). The application gracefully handles missing API keys by using fallback data, so it works immediately after `npm start` without any setup.

### Caching Strategy
Services implement intelligent caching:
- Real-time data: 1-minute cache
- Fallback data: 5-minute cache  
- Custom cache durations supported via service methods

### Error Handling Pattern
All service methods include try/catch blocks that log errors and provide fallback data rather than failing. This ensures the UI always has data to display.

### State Management
- Local component state for UI interactions
- React Context for global themes and language
- Service layer handles all data fetching and caching
- localStorage for persistence (watchlists, preferences)

### TypeScript Usage
All interfaces are defined in `src/types/index.ts`. The codebase maintains strict type safety with proper interfaces for:
- MarketData (stocks with optional name field)
- CommodityData (with category and unit fields)  
- ForexData, CryptocurrencyData, MarketEvent, OpportunityAlert
- Custom watchlist items and search results

## API Rate Limit Handling

The Alpha Vantage free tier has a 25 requests/day limit. The MarketDataService includes comprehensive fallback data for:
- Market indexes (SPY, QQQ, DIA, FXI, EWH, VTI)
- Stock quotes (AAPL, GOOGL, MSFT, TSLA, AMZN, NVDA, etc.)
- Commodity prices (Oil, Gold, Silver, Copper, Wheat, Corn)
- Top gainers/losers with realistic market movements

When working on API-related features, always test both the real API response and the fallback data path.

## Multi-Market Support

The application supports multiple regional markets:
- **US Markets**: Primary focus with comprehensive coverage
- **China Markets**: FXI ETF and major Chinese stocks
- **Hong Kong Markets**: EWH ETF and Hong Kong stocks  
- **Global**: Commodities, forex, and cryptocurrency

Market hours are calculated dynamically using the MarketHoursService utility.

## Real-time Features

The dashboard implements real-time updates through:
- Configurable auto-refresh intervals (default 30 seconds)
- Manual refresh controls
- Real-time market status indicators
- Live price updates with change indicators
- Auto-refreshing charts and opportunity analysis

## Styling Approach

Uses Tailwind CSS with:
- Responsive design (mobile-first)
- Dark/light theme support via CSS variables
- Professional color palette with gradient accents
- Consistent component styling patterns
- Lucide React icons throughout

When adding new components, follow the existing Tailwind patterns and ensure both theme variants work properly.