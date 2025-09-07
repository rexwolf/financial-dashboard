import React from 'react';
import { trackConversion, trackSubscriptionEvent } from './GoogleAnalytics';

// Google Ads conversion labels - these should be configured in Google Ads
const CONVERSION_LABELS = {
  SIGN_UP: 'signup_conversion_label', // Replace with actual conversion label
  SUBSCRIPTION_START: 'subscription_start_conversion_label',
  SUBSCRIPTION_UPGRADE: 'subscription_upgrade_conversion_label',
  CONTACT_FORM: 'contact_form_conversion_label',
  NEWSLETTER_SIGNUP: 'newsletter_signup_conversion_label',
  FREE_TRIAL: 'free_trial_conversion_label',
};

// Google Ads utility functions
export class GoogleAdsTracker {
  // Track user sign up conversion
  static trackSignUp(userEmail?: string) {
    trackConversion(CONVERSION_LABELS.SIGN_UP, 1);
    
    // Also track as a GA event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'sign_up', {
        method: 'email',
        custom_parameters: {
          user_id: userEmail ? btoa(userEmail) : undefined, // Hash email for privacy
        }
      });
    }
  }

  // Track subscription conversion
  static trackSubscription(plan: string, value: number, transactionId?: string) {
    trackConversion(CONVERSION_LABELS.SUBSCRIPTION_START, value, 'USD');
    
    // Enhanced ecommerce tracking
    trackSubscriptionEvent('purchase', {
      transaction_id: transactionId || `sub_${Date.now()}`,
      value: value,
      currency: 'USD',
      items: [{
        item_id: plan.toLowerCase().replace(' ', '_'),
        item_name: `Financial Dashboard ${plan} Plan`,
        category: 'Subscription',
        quantity: 1,
        price: value,
      }]
    });
  }

  // Track subscription upgrade
  static trackSubscriptionUpgrade(fromPlan: string, toPlan: string, value: number) {
    trackConversion(CONVERSION_LABELS.SUBSCRIPTION_UPGRADE, value, 'USD');
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'subscription_upgrade', {
        custom_parameters: {
          from_plan: fromPlan,
          to_plan: toPlan,
          upgrade_value: value,
        }
      });
    }
  }

  // Track free trial start
  static trackFreeTrial(plan: string) {
    trackConversion(CONVERSION_LABELS.FREE_TRIAL, 0);
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'USD',
        value: 0,
        items: [{
          item_id: `trial_${plan.toLowerCase().replace(' ', '_')}`,
          item_name: `${plan} Plan Free Trial`,
          category: 'Trial',
          quantity: 1,
          price: 0,
        }]
      });
    }
  }

  // Track contact form submission
  static trackContactForm(formType: string = 'general') {
    trackConversion(CONVERSION_LABELS.CONTACT_FORM, 1);
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'generate_lead', {
        currency: 'USD',
        value: 10, // Estimated lead value
        custom_parameters: {
          form_type: formType,
        }
      });
    }
  }

  // Track newsletter signup
  static trackNewsletterSignup(source: string = 'website') {
    trackConversion(CONVERSION_LABELS.NEWSLETTER_SIGNUP, 1);
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'newsletter_signup', {
        custom_parameters: {
          source: source,
        }
      });
    }
  }

  // Track key feature usage
  static trackFeatureUsage(feature: string, section: string) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'feature_use', {
        custom_parameters: {
          feature_name: feature,
          section: section,
          timestamp: new Date().toISOString(),
        }
      });
    }
  }

  // Track user engagement milestones
  static trackEngagementMilestone(milestone: string, value?: number) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'milestone_reached', {
        custom_parameters: {
          milestone_type: milestone,
          milestone_value: value,
        }
      });
    }
  }

  // Track watchlist interactions (high-value user behavior)
  static trackWatchlistAction(action: 'add' | 'remove', assetType: string, symbol: string) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'watchlist_interaction', {
        custom_parameters: {
          action: action,
          asset_type: assetType,
          symbol: symbol,
        }
      });
    }
  }

  // Track search queries (for keyword insights)
  static trackSearch(query: string, results: number) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search', {
        search_term: query,
        custom_parameters: {
          results_count: results,
        }
      });
    }
  }
}

// React component for Google Ads remarketing
interface GoogleAdsRemarketingProps {
  section: string;
  userType?: 'free' | 'trial' | 'premium';
  customParameters?: Record<string, string | number>;
}

const GoogleAdsRemarketing: React.FC<GoogleAdsRemarketingProps> = ({ 
  section, 
  userType = 'free',
  customParameters = {}
}) => {
  React.useEffect(() => {
    // Send remarketing data to Google Ads for audience building
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        custom_parameters: {
          section: section,
          user_type: userType,
          page_category: 'financial_dashboard',
          ...customParameters,
        }
      });
    }
  }, [section, userType, customParameters]);

  return null; // This component doesn't render anything
};

export default GoogleAdsRemarketing;