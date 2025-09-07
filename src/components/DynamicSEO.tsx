import React, { useEffect, useState } from 'react';
import SEOHead from './SEOHead';
import { 
  generatePageMetadata, 
  generateCanonicalUrl, 
  generateWebApplicationSchema,
  generateFinancialDataSchema,
  generateBreadcrumbSchema,
  preloadCriticalResources
} from '../utils/seoUtils';
import { MarketData } from '../types';

interface DynamicSEOProps {
  section: string;
  marketData?: MarketData[];
  additionalKeywords?: string[];
  customTitle?: string;
  customDescription?: string;
}

const DynamicSEO: React.FC<DynamicSEOProps> = ({ 
  section, 
  marketData = [], 
  additionalKeywords = [],
  customTitle,
  customDescription
}) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    preloadCriticalResources();
  }, []);
  
  const pageMetadata = generatePageMetadata(section);
  const title = customTitle || pageMetadata.title;
  const description = customDescription || pageMetadata.description;
  const keywords = [pageMetadata.keywords, ...additionalKeywords].join(', ');
  
  // Generate current URL
  const currentUrl = generateCanonicalUrl('/', { section });
  
  // Generate breadcrumb data
  const breadcrumbItems = [
    { name: 'Home', url: 'https://financialdashboard.com' },
    { name: getSectionDisplayName(section), url: currentUrl }
  ];
  
  // Generate JSON-LD structured data
  const structuredData: any[] = [
    generateWebApplicationSchema(),
    generateBreadcrumbSchema(breadcrumbItems)
  ];
  
  // Add financial data schema if market data is available
  if (marketData.length > 0 && section === 'markets') {
    structuredData.push(generateFinancialDataSchema(marketData));
  }
  
  // Combine all structured data
  const jsonLd = {
    "@graph": structuredData
  };
  
  if (!isClient) {
    return null; // Prevent hydration issues
  }
  
  return (
    <SEOHead
      title={title}
      description={description}
      keywords={keywords}
      url={currentUrl}
      type={section === 'markets' ? 'article' : 'website'}
      section={section}
      jsonLd={jsonLd}
    />
  );
};

// Helper function to get display name for sections
const getSectionDisplayName = (section: string): string => {
  const sectionNames: Record<string, string> = {
    markets: 'Market Data',
    portfolio: 'Portfolio',
    opportunities: 'Investment Opportunities',
    watchlist: 'Watchlist',
    settings: 'Settings',
    pricing: 'Pricing',
    login: 'Login',
    register: 'Sign Up',
    support: 'Support'
  };
  
  return sectionNames[section] || 'Dashboard';
};

export default DynamicSEO;