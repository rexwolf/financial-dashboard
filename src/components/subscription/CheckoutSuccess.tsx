import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { subscriptionService } from '../../services/subscriptionService';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';
import { GoogleAdsTracker } from '../GoogleAds';
import { trackEngagement } from '../GoogleAnalytics';

const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const processCheckoutSuccess = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        setError('Invalid checkout session');
        setLoading(false);
        return;
      }

      try {
        await subscriptionService.handleCheckoutSuccess(sessionId);
        await refreshUserProfile();
        setSuccess(true);
        
        // Track successful subscription conversion
        GoogleAdsTracker.trackSubscription('Pro', 29, sessionId);
        trackEngagement('subscription', 'checkout_success', 29);
      } catch (error: any) {
        console.error('Checkout success processing error:', error);
        setError(error.message || 'Failed to process subscription');
      } finally {
        setLoading(false);
      }
    };

    processCheckoutSuccess();
  }, [searchParams, refreshUserProfile]);

  const handleContinue = () => {
    navigate('/profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Processing Your Subscription
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we activate your account...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Subscription Error
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/subscription')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
            
            <button
              onClick={() => navigate('/support')}
              className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Pro!
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your subscription has been activated successfully. You now have access to all premium features and increased API limits.
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            What's New:
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 text-left">
            <li>• Increased API rate limits</li>
            <li>• Real-time market data access</li>
            <li>• Advanced analytics and reports</li>
            <li>• Priority customer support</li>
            <li>• Data export capabilities</li>
          </ul>
        </div>
        
        <button
          onClick={handleContinue}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          Continue to Dashboard
          <ArrowRight className="h-4 w-4 ml-2" />
        </button>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          You can manage your subscription anytime from your profile settings.
        </p>
      </div>
    </div>
  );
};

export default CheckoutSuccess;