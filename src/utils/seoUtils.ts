import { MarketData, CommodityData } from '../types';

// Generate structured data for different page types
export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Financial Dashboard Inc.",
  "url": "https://financialdashboard.com",
  "logo": "https://financialdashboard.com/logo512.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-800-FINANCE",
    "contactType": "customer service",
    "availableLanguage": ["English", "Chinese"]
  },
  "sameAs": [
    "https://twitter.com/FinancialDashboard",
    "https://linkedin.com/company/financial-dashboard"
  ]
});

export const generateWebApplicationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Financial Dashboard",
  "description": "Professional financial dashboard with real-time market data and investment insights",
  "url": "https://financialdashboard.com",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "29.00",
    "priceCurrency": "USD",
    "priceValidUntil": "2024-12-31",
    "availability": "https://schema.org/InStock"
  },
  "author": generateOrganizationSchema(),
  "provider": generateOrganizationSchema()
});

export const generateFinancialDataSchema = (marketData: MarketData[]) => ({
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Real-time Financial Market Data",
  "description": "Live stock prices, market indices, and financial data",
  "keywords": "stock prices, market data, financial information, real-time quotes",
  "provider": generateOrganizationSchema(),
  "distribution": {
    "@type": "DataDownload",
    "encodingFormat": "JSON",
    "contentUrl": "https://api.financialdashboard.com/market-data"
  },
  "temporalCoverage": "2020/2025",
  "spatialCoverage": "Worldwide",
  "variableMeasured": marketData.map(stock => stock.symbol).slice(0, 10)
});

export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const generateProductSchema = (plan: { name: string; price: number; description: string }) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": `Financial Dashboard ${plan.name} Plan`,
  "description": plan.description,
  "brand": generateOrganizationSchema(),
  "offers": {
    "@type": "Offer",
    "price": plan.price.toString(),
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "validFrom": "2025-01-01",
    "priceValidUntil": "2025-12-31"
  },
  "category": "Financial Software",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127"
  }
});

export const generateFAQSchema = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

// SEO meta data generators
export const generatePageMetadata = (section: string) => {
  const metadata = {
    markets: {
      title: 'Real-time Market Data & Stock Quotes | Financial Dashboard',
      description: 'Track live stock prices, market indices, commodities, and forex rates. Get real-time financial data with advanced charts and analytics.',
      keywords: 'stock quotes, market data, real-time prices, market indices, commodities, forex rates, financial charts'
    },
    portfolio: {
      title: 'Portfolio Tracker & Investment Analysis | Financial Dashboard',
      description: 'Monitor your investment portfolio performance with advanced analytics, risk metrics, and personalized insights. Track stocks, bonds, and crypto.',
      keywords: 'portfolio tracker, investment analysis, portfolio performance, risk metrics, asset allocation, investment tracking'
    },
    opportunities: {
      title: 'Investment Opportunities & Market Analysis | Financial Dashboard',
      description: 'Discover profitable investment opportunities with AI-powered analysis. Find undervalued stocks, arbitrage opportunities, and market trends.',
      keywords: 'investment opportunities, stock analysis, arbitrage opportunities, market trends, undervalued stocks, investment research'
    },
    watchlist: {
      title: 'Stock Watchlist & Price Alerts | Financial Dashboard',
      description: 'Create custom watchlists and receive real-time price alerts. Never miss important market movements with our advanced notification system.',
      keywords: 'stock watchlist, price alerts, market notifications, stock tracking, investment monitoring, financial alerts'
    },
    pricing: {
      title: 'Pricing Plans & Subscription Options | Financial Dashboard',
      description: 'Choose the perfect plan for your investment needs. Free and premium options with real-time data, advanced analytics, and portfolio tools.',
      keywords: 'pricing plans, subscription, financial dashboard pricing, investment tools, premium features, trading platform costs'
    }
  };

  return metadata[section as keyof typeof metadata] || {
    title: 'Financial Dashboard - Real-time Market Data & Investment Insights',
    description: 'Professional financial dashboard with real-time stock quotes, market indices, cryptocurrency prices, forex rates, and investment opportunities.',
    keywords: 'financial dashboard, stock market, real-time quotes, investment analysis, portfolio tracking, market data'
  };
};

// Generate dynamic URLs for SEO
export const generateCanonicalUrl = (path: string, params?: Record<string, string>) => {
  const baseUrl = 'https://financialdashboard.com';
  let url = `${baseUrl}${path}`;
  
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

// Generate social media sharing URLs
export const generateSharingUrls = (url: string, title: string, description: string) => ({
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}&via=FinancialDashboard`,
  linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  reddit: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + ' ' + url)}`
});

// Performance and Core Web Vitals optimization
export const preloadCriticalResources = () => {
  if (typeof window !== 'undefined') {
    // Preload critical fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = '/fonts/inter-var.woff2';
    fontLink.as = 'font';
    fontLink.type = 'font/woff2';
    fontLink.crossOrigin = 'anonymous';
    document.head.appendChild(fontLink);
    
    // Preload critical images
    const logoLink = document.createElement('link');
    logoLink.rel = 'preload';
    logoLink.href = '/logo512.png';
    logoLink.as = 'image';
    document.head.appendChild(logoLink);
  }
};

// Lazy loading utilities
export const observeElementsForLazyLoading = (elements: NodeListOf<Element>, callback: (element: Element) => void) => {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px'
    });
    
    elements.forEach(element => observer.observe(element));
    return observer;
  }
  
  // Fallback for browsers without IntersectionObserver
  elements.forEach(element => callback(element));
  return null;
};