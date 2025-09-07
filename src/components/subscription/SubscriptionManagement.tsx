import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { subscriptionService, SubscriptionPlans, CurrentSubscription } from '../../services/subscriptionService';
import { 
  Crown, 
  Check, 
  Loader2, 
  CreditCard, 
  Calendar, 
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Star,
  Zap
} from 'lucide-react';

const SubscriptionManagement: React.FC = () => {
  const { userProfile, refreshUserProfile } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlans | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [plansData, subscriptionData] = await Promise.all([
        subscriptionService.getAvailablePlans(),
        subscriptionService.getCurrentSubscription()
      ]);
      
      setPlans(plansData);
      setCurrentSubscription(subscriptionData);
    } catch (error: any) {
      setError(error.message || 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (priceId: string) => {
    if (!subscriptionService.isValidPriceId(priceId)) {
      setError('Invalid subscription plan selected');
      return;
    }

    try {
      setActionLoading(priceId);
      setError(null);
      
      const { checkout_url } = await subscriptionService.createCheckoutSession(priceId);
      
      // Redirect to Stripe checkout
      window.location.href = checkout_url;
    } catch (error: any) {
      setError(error.message || 'Failed to create checkout session');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? It will remain active until the end of your current billing period.')) {
      return;
    }

    try {
      setActionLoading('cancel');
      setError(null);
      
      await subscriptionService.cancelSubscription();
      await loadSubscriptionData();
      await refreshUserProfile();
    } catch (error: any) {
      setError(error.message || 'Failed to cancel subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setActionLoading('reactivate');
      setError(null);
      
      await subscriptionService.reactivateSubscription();
      await loadSubscriptionData();
      await refreshUserProfile();
    } catch (error: any) {
      setError(error.message || 'Failed to reactivate subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      setActionLoading('portal');
      setError(null);
      
      const { portal_url } = await subscriptionService.createCustomerPortalSession();
      
      // Open portal in new tab
      window.open(portal_url, '_blank');
    } catch (error: any) {
      setError(error.message || 'Failed to open billing portal');
    } finally {
      setActionLoading(null);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'enterprise':
        return <Crown className="h-6 w-6 text-purple-600" />;
      case 'pro':
        return <Star className="h-6 w-6 text-blue-600" />;
      default:
        return <Zap className="h-6 w-6 text-green-600" />;
    }
  };

  const isCurrentPlan = (planName: string) => {
    return currentSubscription?.subscription_plan === planName.toUpperCase();
  };

  const canUpgrade = (planName: string) => {
    const currentPlan = currentSubscription?.subscription_plan || 'FREE';
    const planHierarchy = { 'FREE': 0, 'PRO': 1, 'ENTERPRISE': 2 };
    return planHierarchy[currentPlan as keyof typeof planHierarchy] < planHierarchy[planName.toUpperCase() as keyof typeof planHierarchy];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="ml-3 text-red-800 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Current Subscription Status */}
      {currentSubscription && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Current Subscription</h2>
            <button
              onClick={loadSubscriptionData}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Refresh subscription data"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${subscriptionService.getPlanColor(currentSubscription.subscription_plan)}`}>
                {getPlanIcon(currentSubscription.subscription_plan)}
                <span className="ml-2">{currentSubscription.plan_display_name}</span>
              </div>
            </div>
            
            {currentSubscription.has_active_subscription && (
              <>
                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
                  <div className="font-medium text-gray-900 dark:text-white capitalize">
                    {currentSubscription.status?.toLowerCase()}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {currentSubscription.canceled_at ? 'Expires' : 'Renews'}
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {currentSubscription.current_period_end ? 
                      new Date(currentSubscription.current_period_end).toLocaleDateString() : 
                      'N/A'
                    }
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Subscription Actions */}
          {currentSubscription.has_active_subscription && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleManageBilling}
                  disabled={actionLoading === 'portal'}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  {actionLoading === 'portal' ? (
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  ) : (
                    <CreditCard className="h-4 w-4 mr-2" />
                  )}
                  Manage Billing
                  <ExternalLink className="h-4 w-4 ml-2" />
                </button>

                {currentSubscription.canceled_at ? (
                  <button
                    onClick={handleReactivateSubscription}
                    disabled={actionLoading === 'reactivate'}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    {actionLoading === 'reactivate' ? (
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Reactivate
                  </button>
                ) : (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={actionLoading === 'cancel'}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    {actionLoading === 'cancel' ? (
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 mr-2" />
                    )}
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Available Plans */}
      {plans && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Upgrade your account to unlock advanced features and higher API limits for professional trading and analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(plans).map(([key, plan]) => (
              <div 
                key={key}
                className={`relative rounded-lg border-2 p-6 ${
                  isCurrentPlan(key) 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                } transition-colors`}
              >
                {isCurrentPlan(key) && (
                  <div className="absolute top-0 right-0 -mt-4 -mr-4">
                    <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Current Plan
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  {getPlanIcon(key)}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-3 mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {subscriptionService.formatPrice(plan.price)}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="ml-3 text-gray-600 dark:text-gray-400 text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  {isCurrentPlan(key) ? (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium py-3 px-4 rounded-lg text-center">
                      Current Plan
                    </div>
                  ) : canUpgrade(key) && plan.price_id ? (
                    <button
                      onClick={() => handleUpgrade(plan.price_id!)}
                      disabled={actionLoading === plan.price_id}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                    >
                      {actionLoading === plan.price_id ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          Processing...
                        </>
                      ) : (
                        'Upgrade Now'
                      )}
                    </button>
                  ) : plan.price === 0 ? (
                    <div className="w-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium py-3 px-4 rounded-lg text-center">
                      Free Forever
                    </div>
                  ) : (
                    <div className="w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium py-3 px-4 rounded-lg text-center">
                      Contact Sales
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Stats */}
      {userProfile?.quotaStats && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Current Usage
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userProfile.quotaStats.dailyUsage}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">API Calls Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userProfile.quotaStats.dailyQuota}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Daily Limit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userProfile.quotaStats.usagePercentage?.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Usage Today</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Daily Usage</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {userProfile.quotaStats.dailyUsage} / {userProfile.quotaStats.dailyQuota}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(userProfile.quotaStats.usagePercentage || 0, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
