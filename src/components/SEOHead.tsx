import React, { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  jsonLd?: any;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Financial Dashboard - Real-time Market Data & Investment Insights',
  description = 'Professional financial dashboard with real-time stock quotes, market indices, cryptocurrency prices, forex rates, and investment opportunities. Track your portfolio with advanced analytics.',
  keywords = 'financial dashboard, stock market, real-time quotes, investment analysis, portfolio tracking, market data, cryptocurrency, forex, trading platform',
  image = 'https://financialdashboard.com/og-image.jpg',
  url = 'https://financialdashboard.com',
  type = 'website',
  publishedTime,
  modifiedTime,
  section,
  jsonLd
}) => {
  const fullTitle = title.includes('Financial Dashboard') ? title : `${title} | Financial Dashboard`;

  useEffect(() => {
    // Title
    document.title = fullTitle;

    const upsertMeta = (attr: 'name' | 'property', key: string, content?: string) => {
      if (!content) return;
      let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Primary
    upsertMeta('name', 'title', fullTitle);
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'keywords', keywords);

    // Open Graph
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:image', image);
    upsertMeta('property', 'og:site_name', 'Financial Dashboard');
    upsertMeta('property', 'og:locale', 'en_US');

    if (type === 'article') {
      upsertMeta('property', 'article:published_time', publishedTime);
      upsertMeta('property', 'article:modified_time', modifiedTime);
      upsertMeta('property', 'article:section', section);
    }

    // Twitter
    upsertMeta('property', 'twitter:card', 'summary_large_image');
    upsertMeta('property', 'twitter:url', url);
    upsertMeta('property', 'twitter:title', fullTitle);
    upsertMeta('property', 'twitter:description', description);
    upsertMeta('property', 'twitter:image', image);
    upsertMeta('property', 'twitter:creator', '@FinancialDashboard');

    // Canonical link
    if (url) {
      let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', url);
    }

    // JSON-LD
    const existingLd = document.head.querySelector('script[type="application/ld+json"]');
    if (existingLd) existingLd.remove();
    if (jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [fullTitle, description, keywords, image, url, type, publishedTime, modifiedTime, section, jsonLd]);

  return null;
};

export default SEOHead;
