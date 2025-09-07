import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  subscriptionPlan: string;
  emailVerified: boolean;
}

export interface UserProfile {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  subscriptionPlan: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
  apiKey: string;
  quotaStats: {
    plan: string;
    dailyQuota: number;
    dailyUsage: number;
    remainingQuota: number;
    usagePercentage: number;
  };
}

export interface AccountSummary {
  userId: number;
  email: string;
  fullName: string;
  subscriptionPlan: string;
  memberSince: string;
  lastLogin: string;
  quotaStats: {
    plan: string;
    dailyQuota: number;
    dailyUsage: number;
    remainingQuota: number;
    usagePercentage: number;
  };
  recentRequestCount: number;
  activeDays: number;
}

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.loadTokensFromStorage();
    this.setupInterceptors();
  }

  private loadTokensFromStorage() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  private saveTokensToStorage(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private clearTokensFromStorage() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  private setupInterceptors() {
    // Request interceptor to add auth header
    if (axios.interceptors && axios.interceptors.request) {
      axios.interceptors.request.use((config) => {
        if (this.accessToken && config.url?.startsWith(API_BASE_URL)) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      });
    }

    // Response interceptor to handle token refresh
    if (axios.interceptors && axios.interceptors.response) {
      axios.interceptors.response.use(
        (response) => response,
        async (error) => {
          const originalRequest = error.config;

          if (error.response?.status === 401 && !originalRequest._retry && this.refreshToken) {
            originalRequest._retry = true;

          try {
            const response = await this.refreshAccessToken();
            this.saveTokensToStorage(response.accessToken, response.refreshToken);
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            this.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
      );
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
      const authData: AuthResponse = response.data;
      
      this.saveTokensToStorage(authData.accessToken, authData.refreshToken);
      
      return authData;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
      const authData: AuthResponse = response.data;
      
      this.saveTokensToStorage(authData.accessToken, authData.refreshToken);
      
      return authData;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  async refreshAccessToken(): Promise<AuthResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
        refreshToken: this.refreshToken
      });
      const authData: AuthResponse = response.data;
      // Persist new tokens so subsequent requests use them
      this.saveTokensToStorage(authData.accessToken, authData.refreshToken);
      return authData;
    } catch (error: any) {
      throw new Error('Token refresh failed');
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.accessToken) {
        await axios.post(`${API_BASE_URL}/api/auth/logout`);
      }
    } catch (error) {
      // Ignore logout errors
      console.warn('Logout request failed:', error);
    } finally {
      this.clearTokensFromStorage();
    }
  }

  async getCurrentUser(): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/me`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get user info');
    }
  }

  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/profile`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get user profile');
    }
  }

  async updateProfile(profileData: { firstName: string; lastName: string }): Promise<UserProfile> {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/user/profile`, profileData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }

  async getAccountSummary(): Promise<AccountSummary> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/summary`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get account summary');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/change-password`, {
        currentPassword,
        newPassword
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  }

  async regenerateApiKey(): Promise<string> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/user/api-key/regenerate`);
      return response.data.apiKey;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to regenerate API key');
    }
  }

  async upgradeSubscription(plan: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/api/user/subscription/upgrade`, { plan });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upgrade subscription');
    }
  }

  async getUsageHistory(days: number = 30): Promise<any[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/usage?days=${days}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get usage history');
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}

export const authService = new AuthService();
