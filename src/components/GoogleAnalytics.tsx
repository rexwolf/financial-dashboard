import React, { useEffect } from 'react';

// Google Analytics configuration
const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
const GOOGLE_ADS_ID = process.env.REACT_APP_GOOGLE_ADS_ID || 'AW-XXXXXXXXX';

// Google Analytics utility functions
export const initializeGA = () => {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    console.log('Google Analytics not initialized - missing measurement ID');
    return;
  }

  // Load Google Analytics script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });

  // Initialize Google Ads if ID is provided
  if (GOOGLE_ADS_ID && GOOGLE_ADS_ID !== 'AW-XXXXXXXXX') {
    gtag('config', GOOGLE_ADS_ID);
  }

  console.log('Google Analytics initialized with ID:', GA_MEASUREMENT_ID);
};

// Track page views
export const trackPageView = (page_path: string, page_title?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path,
    page_title: page_title || document.title,
  });
};

// Track events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track conversions for Google Ads
export const trackConversion = (conversionLabel: string, value?: number, currency?: string) => {
  if (typeof window === 'undefined' || !window.gtag || !GOOGLE_ADS_ID || GOOGLE_ADS_ID === 'AW-XXXXXXXXX') return;

  window.gtag('event', 'conversion', {
    send_to: `${GOOGLE_ADS_ID}/${conversionLabel}`,
    value: value,
    currency: currency || 'USD',
  });
};

// Enhanced ecommerce tracking for subscription events
export const trackSubscriptionEvent = (eventName: 'begin_checkout' | 'purchase', transactionData: {
  transaction_id?: string;
  value: number;
  currency?: string;
  items: {
    item_id: string;
    item_name: string;
    category: string;
    quantity: number;
    price: number;
  }[];
}) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', eventName, {
    currency: transactionData.currency || 'USD',
    value: transactionData.value,
    transaction_id: transactionData.transaction_id,
    items: transactionData.items,
  });
};

// Track user engagement
export const trackEngagement = (section: string, action: string, value?: number) => {
  trackEvent(action, 'User Engagement', section, value);
};

// Component for initializing Google Analytics
interface GoogleAnalyticsProps {
  children?: React.ReactNode;
}

const GoogleAnalytics: React.FC<GoogleAnalyticsProps> = ({ children }) => {
  useEffect(() => {
    initializeGA();
  }, []);

  return <>{children}</>;
};

// Hook for tracking page views in React Router
export const usePageTracking = (pathname: string, title?: string) => {
  useEffect(() => {
    // Small delay to ensure page has loaded
    const timer = setTimeout(() => {
      trackPageView(pathname, title);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, title]);
};

// Declare global gtag types
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default GoogleAnalytics;