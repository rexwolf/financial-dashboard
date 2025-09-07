import React, { useState } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Star, 
  Bug, 
  Lightbulb, 
  HelpCircle,
  ThumbsUp,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { GoogleAdsTracker } from '../GoogleAds';
import { trackEngagement } from '../GoogleAnalytics';

interface FeedbackWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'center';
}

type FeedbackType = 'bug' | 'feature' | 'question' | 'compliment' | 'other';

interface FeedbackForm {
  type: FeedbackType;
  rating: number;
  title: string;
  message: string;
  email: string;
  includeEmail: boolean;
}

const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ 
  isOpen, 
  onClose, 
  position = 'bottom-right' 
}) => {
  const [step, setStep] = useState<'type' | 'form' | 'success'>('type');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackForm>({
    type: 'other',
    rating: 0,
    title: '',
    message: '',
    email: '',
    includeEmail: false
  });

  const feedbackTypes = [
    {
      id: 'bug' as FeedbackType,
      icon: Bug,
      title: 'Report a Bug',
      description: 'Something isn\'t working as expected',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30'
    },
    {
      id: 'feature' as FeedbackType,
      icon: Lightbulb,
      title: 'Feature Request',
      description: 'Suggest an improvement or new feature',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
    },
    {
      id: 'question' as FeedbackType,
      icon: HelpCircle,
      title: 'Ask a Question',
      description: 'Get help with using our platform',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      id: 'compliment' as FeedbackType,
      icon: ThumbsUp,
      title: 'Share Feedback',
      description: 'Tell us what you love about our product',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    }
  ];

  const handleTypeSelect = (type: FeedbackType) => {
    setFeedback(prev => ({ ...prev, type }));
    setStep('form');
  };

  const handleRatingClick = (rating: number) => {
    setFeedback(prev => ({ ...prev, rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real implementation, this would send to your backend
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...feedback,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });

      if (response.ok) {
        setStep('success');
        
        // Track feedback submission
        GoogleAdsTracker.trackContactForm(feedback.type);
        trackEngagement('support', 'feedback_submitted', feedback.rating);
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again or contact support directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setStep('type');
    setFeedback({
      type: 'other',
      rating: 0,
      title: '',
      message: '',
      email: '',
      includeEmail: false
    });
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default:
        return 'bottom-4 right-4';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed z-50 ${getPositionClasses()}`}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-96 max-w-[90vw]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {step === 'success' ? 'Thank You!' : 'Send Feedback'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-4">
          {step === 'type' && (
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                How can we help you today?
              </p>
              <div className="space-y-3">
                {feedbackTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => handleTypeSelect(type.id)}
                      className="w-full flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${type.bgColor} flex items-center justify-center mr-3`}>
                        <IconComponent className={`h-5 w-5 ${type.color}`} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {type.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {type.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  How would you rate your overall experience?
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      className={`p-1 transition-colors ${
                        star <= feedback.rating
                          ? 'text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
                      }`}
                    >
                      <Star className={`h-6 w-6 ${star <= feedback.rating ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  id="title"
                  type="text"
                  value={feedback.title}
                  onChange={(e) => setFeedback(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief summary of your feedback"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white placeholder-gray-400 text-sm"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Details
                </label>
                <textarea
                  id="message"
                  value={feedback.message}
                  onChange={(e) => setFeedback(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Please provide more details about your feedback..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white placeholder-gray-400 text-sm resize-none"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <div className="flex items-center mb-2">
                  <input
                    id="includeEmail"
                    type="checkbox"
                    checked={feedback.includeEmail}
                    onChange={(e) => setFeedback(prev => ({ ...prev, includeEmail: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeEmail" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    I'd like a response (optional)
                  </label>
                </div>
                {feedback.includeEmail && (
                  <input
                    type="email"
                    value={feedback.email}
                    onChange={(e) => setFeedback(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your.email@example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white placeholder-gray-400 text-sm"
                    required={feedback.includeEmail}
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('type')}
                  className="flex-1 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  disabled={isSubmitting}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Feedback
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Feedback Sent Successfully!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Thank you for your feedback. We read every message and use them to improve our platform.
                {feedback.includeEmail && ' We\'ll get back to you within 24 hours.'}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    reset();
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={reset}
                  className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Send Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackWidget;