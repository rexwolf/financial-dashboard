import React, { useEffect } from 'react';
import { 
  generatePageMetadata, 
  generateCanonicalUrl, 
  generateWebApplicationSchema,
  generateFinancialDataSchema,
  generateBreadcrumbSchema
} from '../utils/seoUtils';
import { MarketData } from '../types';

interface SEOMetaTagsProps {
  section: string;
  marketData?: MarketData[];
  additionalKeywords?: string[];
  customTitle?: string;
  customDescription?: string;
}

const SEOMetaTags: React.FC<SEOMetaTagsProps> = ({ 
  section, 
  marketData = [], 
  additionalKeywords = [],
  customTitle,
  customDescription
}) => {
  useEffect(() => {
    const pageMetadata = generatePageMetadata(section);
    const title = customTitle || pageMetadata.title;
    const description = customDescription || pageMetadata.description;
    const keywords = [pageMetadata.keywords, ...additionalKeywords].join(', ');
    const currentUrl = generateCanonicalUrl('/', { section });
    
    // Update document title
    document.title = title;
    
    // Update or create meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', 'Financial Dashboard');
    updateMetaTag('robots', 'index, follow');
    
    // Open Graph tags
    updateMetaProperty('og:title', title);
    updateMetaProperty('og:description', description);
    updateMetaProperty('og:url', currentUrl);
    updateMetaProperty('og:type', section === 'markets' ? 'article' : 'website');
    updateMetaProperty('og:image', 'https://financialdashboard.com/og-image.jpg');
    updateMetaProperty('og:site_name', 'Financial Dashboard');
    
    // Twitter tags
    updateMetaProperty('twitter:card', 'summary_large_image');
    updateMetaProperty('twitter:title', title);
    updateMetaProperty('twitter:description', description);
    updateMetaProperty('twitter:image', 'https://financialdashboard.com/og-image.jpg');
    updateMetaProperty('twitter:creator', '@FinancialDashboard');
    
    // Update canonical link
    updateCanonicalLink(currentUrl);
    
    // Add structured data
    const breadcrumbItems = [
      { name: 'Home', url: 'https://financialdashboard.com' },
      { name: getSectionDisplayName(section), url: currentUrl }
    ];
    
    const structuredData: any[] = [
      generateWebApplicationSchema(),
      generateBreadcrumbSchema(breadcrumbItems)
    ];
    
    if (marketData.length > 0 && section === 'markets') {
      structuredData.push(generateFinancialDataSchema(marketData));
    }
    
    updateStructuredData({
      "@graph": structuredData
    });
    
  }, [section, marketData, additionalKeywords, customTitle, customDescription]);
  
  return null; // This component doesn't render anything
};

// Helper functions to update meta tags
const updateMetaTag = (name: string, content: string) => {
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    (meta as HTMLMetaElement).name = name;
    document.head.appendChild(meta);
  }
  (meta as HTMLMetaElement).content = content;
};

const updateMetaProperty = (property: string, content: string) => {
  let meta = document.querySelector(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    (meta as HTMLMetaElement).setAttribute('property', property);
    document.head.appendChild(meta);
  }
  (meta as HTMLMetaElement).content = content;
};

const updateCanonicalLink = (href: string) => {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = href;
};

const updateStructuredData = (data: any) => {
  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }
  
  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

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

export default SEOMetaTags;