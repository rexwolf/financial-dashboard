import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, AuthResponse, UserProfile } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthResponse | null;
  userProfile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize authentication state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        // Try to get current user info
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
        
        // Load user profile
        await loadUserProfile();
      }
    } catch (error) {
      // Token might be expired or invalid
      console.warn('Failed to initialize auth:', error);
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const profile = await authService.getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.warn('Failed to load user profile:', error);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const authResponse = await authService.login({ email, password });
      
      setUser(authResponse);
      setIsAuthenticated(true);
      
      // Load user profile after successful login
      await loadUserProfile();
      
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const authResponse = await authService.register({ email, password, firstName, lastName });
      
      setUser(authResponse);
      setIsAuthenticated(true);
      
      // Load user profile after successful registration
      await loadUserProfile();
      
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setUserProfile(null);
      setLoading(false);
    }
  };

  const refreshUserProfile = async (): Promise<void> => {
    if (isAuthenticated) {
      await loadUserProfile();
    }
  };

  const clearError = () => {
    setError(null);
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    userProfile,
    login,
    register,
    logout,
    refreshUserProfile,
    loading,
    error,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;