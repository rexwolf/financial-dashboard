import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowLeft, MessageCircle } from 'lucide-react';

const CheckoutCanceled: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <X className="h-8 w-8 text-orange-600 dark:text-orange-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Checkout Canceled
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          No worries! You can upgrade your subscription anytime. Your current plan remains active and you can continue using all available features.
        </p>
        
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Still interested in upgrading?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Our premium plans offer increased API limits, real-time data, and advanced analytics to enhance your trading experience.
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/subscription')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            View Pricing Plans
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          
          <button
            onClick={() => navigate('/support')}
            className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Have Questions? Contact Support
          </button>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
          You can upgrade or change your plan anytime from your profile settings.
        </p>
      </div>
    </div>
  );
};

export default CheckoutCanceled;