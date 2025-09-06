import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translations object
const translations = {
  en: {
    // Header
    'header.search': 'Search markets, symbols...',
    'header.realtime': 'Real-time',
    
    // Navigation
    'nav.overview': 'Overview',
    'nav.markets': 'Markets',
    'nav.commodities': 'Commodities',
    'nav.forex': 'Forex',
    'nav.crypto': 'Cryptocurrency',
    'nav.opportunities': 'Opportunities',
    'nav.alerts': 'Alerts',
    'nav.settings': 'Settings',
    'nav.navigation': 'Navigation',
    
    // Market Status
    'market.status': 'Market Status',
    'market.open': 'Markets are open',
    'market.closed': 'Markets are closed',
    
    // Overview Page
    'overview.active.markets': 'Active Markets',
    'overview.gainers': 'Gainers',
    'overview.losers': 'Losers',
    'overview.opportunities': 'Opportunities',
    'overview.commodities': 'Commodities',
    
    // Chart
    'chart.last.updated': 'Last updated',
    'chart.auto.refresh': 'Auto-refresh',
    'chart.data.points': 'data points',
    'chart.pause': 'Pause auto-refresh',
    'chart.start': 'Start auto-refresh',
    'chart.refresh': 'Refresh now',
    
    // Common
    'common.loading': 'Loading market data...',
    'common.coming.soon': 'Coming Soon',
    'common.under.development': 'This section is under development.',
    'common.change': 'Change',
    'common.volume': 'Volume',
    'common.market.cap': 'Market Cap',
  },
  zh: {
    // Header
    'header.search': '搜索市场、股票代码...',
    'header.realtime': '实时',
    
    // Navigation
    'nav.overview': '总览',
    'nav.markets': '市场',
    'nav.commodities': '商品',
    'nav.forex': '外汇',
    'nav.crypto': '加密货币',
    'nav.opportunities': '投资机会',
    'nav.alerts': '提醒',
    'nav.settings': '设置',
    'nav.navigation': '导航',
    
    // Market Status
    'market.status': '市场状态',
    'market.open': '市场开放',
    'market.closed': '市场关闭',
    
    // Overview Page
    'overview.active.markets': '活跃市场',
    'overview.gainers': '上涨',
    'overview.losers': '下跌',
    'overview.opportunities': '投资机会',
    'overview.commodities': '商品',
    
    // Chart
    'chart.last.updated': '最后更新',
    'chart.auto.refresh': '自动刷新',
    'chart.data.points': '数据点',
    'chart.pause': '暂停自动刷新',
    'chart.start': '开始自动刷新',
    'chart.refresh': '立即刷新',
    
    // Common
    'common.loading': '正在加载市场数据...',
    'common.coming.soon': '即将推出',
    'common.under.development': '此功能正在开发中。',
    'common.change': '变化',
    'common.volume': '成交量',
    'common.market.cap': '市值',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage || 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const translation = translations[language]?.[key as keyof typeof translations['en']];
    return translation || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};