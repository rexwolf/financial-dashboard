import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { 
  User, 
  Mail, 
  Calendar, 
  Key, 
  BarChart3, 
  Settings, 
  Crown,
  Loader2,
  Copy,
  CheckCircle,
  Edit3,
  Save,
  X
} from 'lucide-react';

const UserProfile: React.FC = () => {
  const { userProfile, refreshUserProfile, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: ''
  });
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setEditForm({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName
      });
    }
  }, [userProfile]);

  const handleUpdateProfile = async () => {
    if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
      setError('First name and last name are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.updateProfile(editForm);
      await refreshUserProfile();
      setIsEditing(false);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateApiKey = async () => {
    if (!confirm('Are you sure you want to regenerate your API key? Your old key will stop working immediately.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.regenerateApiKey();
      await refreshUserProfile();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyApiKey = () => {
    if (userProfile?.apiKey) {
      navigator.clipboard.writeText(userProfile.apiKey);
      setApiKeyCopied(true);
      setTimeout(() => setApiKeyCopied(false), 2000);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan.toUpperCase()) {
      case 'ENTERPRISE':
        return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30';
      case 'PRO':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      default:
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
    }
  };

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
              <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {userProfile.firstName} {userProfile.lastName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center mt-1">
                <Mail className="h-4 w-4 mr-1" />
                {userProfile.email}
              </p>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getPlanColor(userProfile.subscriptionPlan)}`}>
            <Crown className="h-4 w-4 mr-1" />
            {userProfile.subscriptionPlan}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userProfile.quotaStats?.dailyUsage || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Requests Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userProfile.quotaStats?.remainingQuota || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Remaining Quota</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userProfile.quotaStats?.usagePercentage?.toFixed(1) || 0}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Usage Today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Profile Settings
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({
                    firstName: userProfile.firstName,
                    lastName: userProfile.lastName
                  });
                }}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Full Name</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {userProfile.firstName} {userProfile.lastName}
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Email Address</div>
                <div className="font-medium text-gray-900 dark:text-white">{userProfile.email}</div>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Member Since</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {new Date(userProfile.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* API Key Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
          <Key className="h-5 w-5 mr-2" />
          API Key Management
        </h2>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 mr-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your API Key</div>
              <div className="font-mono text-sm text-gray-900 dark:text-white break-all">
                {userProfile.apiKey ? `${userProfile.apiKey.substring(0, 20)}...` : 'Loading...'}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={copyApiKey}
                className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {apiKeyCopied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={handleRegenerateApiKey}
                disabled={loading}
                className="flex items-center px-3 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : <Key className="h-4 w-4 mr-1" />}
                Regenerate
              </button>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
          Use this API key to authenticate your requests. Keep it secure and don't share it publicly.
        </p>
      </div>

      {/* Usage Statistics */}
      {userProfile.quotaStats && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
            <BarChart3 className="h-5 w-5 mr-2" />
            Usage Statistics
          </h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Daily Usage</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {userProfile.quotaStats.dailyUsage} / {userProfile.quotaStats.dailyQuota}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(userProfile.quotaStats.usagePercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;