import axios from 'axios';
import { authService } from './authService';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export interface SubscriptionPlan {
  name: string;
  price: number;
  price_id: string | null;
  features: string[];
}

export interface CurrentSubscription {
  subscription_plan: string;
  plan_display_name: string;
  subscription_id?: string;
  status?: string;
  current_period_end?: string;
  canceled_at?: string;
  has_active_subscription: boolean;
}

export interface SubscriptionPlans {
  free: SubscriptionPlan;
  pro: SubscriptionPlan;
  enterprise: SubscriptionPlan;
}

class SubscriptionService {
  private axiosInstance = axios.create({
    baseURL: `${BASE_URL}/api/subscriptions`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Add request interceptor to include auth token
    if (this.axiosInstance.interceptors && this.axiosInstance.interceptors.request) {
      this.axiosInstance.interceptors.request.use(
        (config) => {
          const token = authService.getAccessToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    }

    // Add response interceptor to handle token refresh
    if (this.axiosInstance.interceptors && this.axiosInstance.interceptors.response) {
      this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshed = await authService.refreshAccessToken();
            const newToken = refreshed?.accessToken || authService.getAccessToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            authService.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
      );
    }
  }

  async getAvailablePlans(): Promise<SubscriptionPlans> {
    const response = await this.axiosInstance.get('/plans');
    return response.data;
  }

  async getCurrentSubscription(): Promise<CurrentSubscription> {
    const response = await this.axiosInstance.get('/current');
    return response.data;
  }

  async createCheckoutSession(priceId: string): Promise<{ checkout_url: string }> {
    const response = await this.axiosInstance.post('/create-checkout-session', {
      priceId
    });
    return response.data;
  }

  async cancelSubscription(): Promise<{ status: string }> {
    const response = await this.axiosInstance.post('/cancel');
    return response.data;
  }

  async reactivateSubscription(): Promise<{ status: string }> {
    const response = await this.axiosInstance.post('/reactivate');
    return response.data;
  }

  async createCustomerPortalSession(): Promise<{ portal_url: string }> {
    const response = await this.axiosInstance.post('/portal');
    return response.data;
  }

  async handleCheckoutSuccess(sessionId: string): Promise<{ status: string }> {
    const response = await this.axiosInstance.post(`/checkout/success?session_id=${sessionId}`);
    return response.data;
  }

  // Utility methods
  getPlanDisplayName(plan: string): string {
    switch (plan.toUpperCase()) {
      case 'PRO':
        return 'Pro Plan';
      case 'ENTERPRISE':
        return 'Enterprise Plan';
      default:
        return 'Free Plan';
    }
  }

  getPlanColor(plan: string): string {
    switch (plan.toUpperCase()) {
      case 'ENTERPRISE':
        return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30';
      case 'PRO':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      default:
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
    }
  }

  formatPrice(price: number): string {
    if (price === 0) return 'Free';
    return `$${price}/month`;
  }

  isValidPriceId(priceId: string | null): priceId is string {
    return priceId !== null && priceId.startsWith('price_');
  }
}

export const subscriptionService = new SubscriptionService();
