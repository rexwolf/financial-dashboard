# Google Analytics & Google Ads Setup Guide

This guide explains how to set up Google Analytics 4 (GA4) and Google Ads tracking for the Financial Dashboard application.

## 🔧 Quick Setup

### 1. Environment Variables

Add these to your `.env` file:

```bash
# Google Analytics 4 Measurement ID
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Ads Customer ID (optional)
REACT_APP_GOOGLE_ADS_ID=AW-XXXXXXXXX
```

### 2. Get Your Google Analytics Measurement ID

1. Go to [Google Analytics](https://analytics.google.com)
2. Create a new GA4 property for your website
3. Set up a data stream for your web app
4. Copy the Measurement ID (format: G-XXXXXXXXXX)

### 3. Set Up Google Ads (Optional)

1. Go to [Google Ads](https://ads.google.com)
2. Create a Google Ads account
3. Get your Google Ads ID (format: AW-XXXXXXXXX)
4. Set up conversion actions for key business events

## 📊 What Gets Tracked

### Automatic Tracking
- **Page Views**: Every section change in the dashboard
- **User Engagement**: Time spent in different sections
- **Search**: Asset search queries and results
- **Watchlist Actions**: Adding/removing stocks, crypto, commodities

### Business Events
- **Subscription Conversions**: Successful payments tracked with value
- **User Registration**: Account creation events
- **Feedback Submissions**: Contact form submissions
- **Feature Usage**: Key feature interactions

### E-commerce Events
- **begin_checkout**: When users start subscription process
- **purchase**: Successful subscription payments
- **subscription_upgrade**: Plan upgrades

## 🎯 Google Ads Conversion Setup

### Required Conversion Actions

Create these conversion actions in Google Ads:

1. **Sign Up** - User registration
   - Value: 1 USD
   - Category: Sign up

2. **Subscription Start** - New subscription
   - Value: 29 USD (or your pricing)
   - Category: Purchase

3. **Contact Form** - Feedback/support submissions
   - Value: 10 USD (estimated lead value)
   - Category: Contact

4. **Free Trial** - Trial sign-ups
   - Value: 0 USD
   - Category: Sign up

### Update Conversion Labels

Edit the conversion labels in `src/components/GoogleAds.tsx`:

```typescript
const CONVERSION_LABELS = {
  SIGN_UP: 'your_signup_conversion_label',
  SUBSCRIPTION_START: 'your_subscription_conversion_label',
  SUBSCRIPTION_UPGRADE: 'your_upgrade_conversion_label',
  CONTACT_FORM: 'your_contact_conversion_label',
  // ... etc
};
```

## 🔍 Data You'll See

### Google Analytics Dashboard

**User Behavior:**
- Most viewed sections (markets, crypto, forex, etc.)
- User engagement patterns
- Search behavior and popular assets
- Conversion funnels

**Business Metrics:**
- Subscription conversion rates
- User journey analysis
- Feature adoption rates
- Support interaction patterns

### Google Ads Insights

**Campaign Performance:**
- Conversion tracking for all major business events
- ROI calculation for ad spend
- Audience insights for remarketing
- Keyword performance for financial terms

## 🚀 Advanced Features

### Custom Events

The implementation includes several custom events you can use:

```typescript
// Track feature usage
GoogleAdsTracker.trackFeatureUsage('advanced_charts', 'markets');

// Track user milestones
GoogleAdsTracker.trackEngagementMilestone('portfolio_created', 1);

// Track search behavior
GoogleAdsTracker.trackSearch('AAPL', 15);
```

### Remarketing Audiences

The app automatically sends remarketing data for:
- Section-based audiences (users who viewed markets, crypto, etc.)
- User type audiences (free, trial, premium)
- Engagement level audiences (active vs passive users)

### Enhanced Ecommerce

Full ecommerce tracking for subscriptions:
- Product details (plan name, price, currency)
- Transaction IDs for proper attribution
- Revenue tracking for business analysis

## 🛠️ Development vs Production

### Development Mode
- Analytics loads but won't send data if measurement ID is placeholder
- Console logs show what would be tracked
- Safe for development without affecting live data

### Production Mode
- Full tracking active when proper IDs are configured
- Real-time data collection
- Conversion tracking for ads

## 🔒 Privacy & Compliance

### Data Collection
- No personally identifiable information (PII) is tracked
- Email addresses are hashed when tracked
- User consent should be implemented for GDPR compliance
- All tracking follows Google's recommended practices

### Recommended Privacy Setup
1. Add a cookie consent banner
2. Allow users to opt-out of tracking
3. Implement data deletion requests
4. Add privacy policy covering analytics usage

## 📈 Business Intelligence

### Key Metrics to Monitor

**User Acquisition:**
- Traffic sources driving highest-value users
- Conversion rates by marketing channel
- Cost per acquisition (CPA) for different audiences

**User Engagement:**
- Feature adoption rates
- Time spent in different sections
- Watchlist usage patterns
- Search behavior insights

**Revenue Optimization:**
- Subscription conversion funnels
- Pricing page performance
- Upgrade/downgrade patterns
- Customer lifetime value trends

## 🐛 Troubleshooting

### Common Issues

**Analytics Not Loading:**
- Check measurement ID format (G-XXXXXXXXXX)
- Verify environment variable is set correctly
- Check browser console for errors

**Conversions Not Tracking:**
- Verify Google Ads ID format (AW-XXXXXXXXX)
- Update conversion labels in GoogleAds.tsx
- Check Google Ads conversion setup

**Data Not Appearing:**
- Analytics data can take 24-48 hours to appear
- Check if tracking is working in Real-Time reports
- Verify domain setup in Google Analytics

### Testing

```bash
# Check if tracking is working (browser console)
# Look for gtag events in Network tab

# Test events
window.gtag('event', 'test_event', {
  custom_parameters: {
    test: 'value'
  }
});
```

## 📚 Additional Resources

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Google Ads Conversion Tracking](https://developers.google.com/google-ads/api/docs/conversions/overview)
- [Enhanced Ecommerce Setup](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)

## 🤝 Support

If you need help setting up tracking:
1. Check the browser console for errors
2. Use Google Analytics Debug View
3. Test conversions in Google Ads
4. Review this documentation for common issues

The implementation is designed to be robust and will gracefully handle missing IDs or configuration errors without breaking the application.