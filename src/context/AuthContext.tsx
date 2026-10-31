import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Destination } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  favorites: string[]; // destination IDs
  activePage: string;
  pageParams: any;
  toastMessage: string | null;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  chatInitialPrompt: string | null;
  openChatWithPrompt: (prompt?: string) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; unverified?: boolean; verificationCode?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    confirmPassword?: string,
    language?: string
  ) => Promise<{ success: boolean; error?: string; requiresVerification?: boolean; verificationCode?: string; message?: string }>;
  verifyEmail: (email: string, code: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  resendVerificationCode: (email: string) => Promise<{ success: boolean; message?: string; verificationCode?: string; error?: string }>;
  loginWithSocial: (provider: 'google' | 'facebook', profile?: { name?: string; email?: string; avatar?: string }) => Promise<{ success: boolean; error?: string }>;
  sendPasswordResetCode: (email: string) => Promise<{ success: boolean; message?: string; demoCode?: string; error?: string }>;
  confirmPasswordReset: (
    email: string,
    code: string,
    newPassword: string,
    confirmNewPassword?: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  loginAsGuest: () => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  toggleFavorite: (destId: string) => Promise<boolean>;
  isFavorite: (destId: string) => boolean;
  navigateTo: (page: string, params?: any) => void;
  showToast: (msg: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('mlm_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<string[]>(['klcc-petronas', 'nasi-lemak-corner']);
  const [activePage, setActivePage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | null>(null);

  const openChatWithPrompt = (prompt?: string) => {
    if (prompt) setChatInitialPrompt(prompt);
    setIsChatOpen(true);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  const navigateTo = (page: string, params?: any) => {
    setActivePage(page);
    setPageParams(params || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch current user if token exists
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Check if guest token
      if (token.startsWith('guest-') || token === 'guest-token') {
        const guestData = localStorage.getItem('mlm_guest_profile');
        if (guestData) {
          try {
            setUser(JSON.parse(guestData));
            setIsLoading(false);
            return;
          } catch (e) {}
        }
        setUser({
          id: token,
          name: 'Guest Explorer',
          email: 'guest@mylocalmate.local',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          preferredLanguage: 'English',
          travelInterests: ['Food & Street Stalls', 'Culture & Heritage', 'Public Transit'],
          budgetPreference: 'Moderate (RM 50-150/day)',
          createdAt: new Date().toISOString(),
          isGuest: true,
          isVerified: false,
        });
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Token invalid
          localStorage.removeItem('mlm_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn('Error fetching auth user:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [token]);

  // Load favorites
  useEffect(() => {
    async function loadFavorites() {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/favorites', { headers });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.favorites)) {
            setFavorites(data.favorites.map((f: any) => f.destinationId));
          }
        }
      } catch (e) {
        console.warn('Failed to fetch favorites:', e);
      }
    }
    loadFavorites();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: data.error || 'Login failed.',
          unverified: data.unverified || false,
          verificationCode: data.verificationCode,
        };
      }
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('mlm_token', data.token);
      localStorage.removeItem('mlm_guest_profile');
      showToast(`Welcome back, ${data.user.name}! 🌺`);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    confirmPassword?: string,
    language?: string
  ) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword, preferredLanguage: language }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed.' };
      }
      // Mandatory verification: no token is set until user enters 6-digit email code
      showToast(`Verification code sent to ${data.email || email}! Check your email.`);
      return {
        success: true,
        requiresVerification: true,
        verificationCode: data.verificationCode,
        message: data.message,
      };
    } catch (err) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Verification failed.' };
      }
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('mlm_token', data.token);
        localStorage.removeItem('mlm_guest_profile');
      }
      if (data.user) {
        setUser(data.user);
      }
      showToast('Email verified successfully! You are now signed in 🌺');
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const resendVerificationCode = async (email: string) => {
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to resend code.' };
      }
      showToast('New verification code sent! 📬');
      return {
        success: true,
        message: data.message,
        verificationCode: data.verificationCode,
      };
    } catch (err) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const loginWithSocial = async (
    provider: 'google' | 'facebook',
    profile?: { name?: string; email?: string; avatar?: string }
  ) => {
    try {
      const defaultEmail = provider === 'google' ? 'traveler.google@gmail.com' : 'explorer.fb@facebook.com';
      const defaultName = provider === 'google' ? 'Google Traveler' : 'Facebook Explorer';
      const res = await fetch('/api/auth/social-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          email: profile?.email || defaultEmail,
          name: profile?.name || defaultName,
          avatar: profile?.avatar,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || `Failed to sign in with ${provider}.` };
      }
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('mlm_token', data.token);
      localStorage.removeItem('mlm_guest_profile');
      showToast(`Welcome! Signed in with ${provider === 'google' ? 'Google' : 'Facebook'} 🌺`);
      navigateTo('home');
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const sendPasswordResetCode = async (email: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to request reset code.' };
      }
      return { success: true, message: data.message, demoCode: data.demoCode };
    } catch (err) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const confirmPasswordReset = async (
    email: string,
    code: string,
    newPassword: string,
    confirmNewPassword?: string
  ) => {
    try {
      const res = await fetch('/api/auth/confirm-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword, confirmNewPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Password reset failed.' };
      }
      showToast('Password reset successfully! You can now sign in.');
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const loginAsGuest = () => {
    const guestId = 'guest-' + Math.random().toString(36).substring(2, 9);
    const guestUser: User = {
      id: guestId,
      name: 'Guest Explorer',
      email: 'guest@mylocalmate.local',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      preferredLanguage: 'English',
      travelInterests: ['Food & Street Stalls', 'Culture & Heritage', 'Public Transit'],
      budgetPreference: 'Moderate (RM 50-150/day)',
      createdAt: new Date().toISOString(),
      isGuest: true,
      isVerified: false,
    };
    setToken(guestId);
    setUser(guestUser);
    localStorage.setItem('mlm_token', guestId);
    localStorage.setItem('mlm_guest_profile', JSON.stringify(guestUser));
    showToast('Browsing as Guest! 🌿 Feel free to explore maps, trips, and guides.');
    navigateTo('home');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('mlm_token');
    localStorage.removeItem('mlm_guest_profile');
    showToast('Logged out safely. See you soon, mate!');
    navigateTo('home');
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!token) return false;

    // Guest profile local update
    if (user?.isGuest) {
      const updatedGuest = { ...user, ...data };
      setUser(updatedGuest);
      localStorage.setItem('mlm_guest_profile', JSON.stringify(updatedGuest));
      showToast('Guest profile updated! 💚');
      return true;
    }

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        setUser(result.user);
        showToast('Profile updated successfully! 💚');
        return true;
      }
    } catch (err) {
      console.warn('Update profile error:', err);
    }
    return false;
  };

  const toggleFavorite = async (destId: string) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers,
        body: JSON.stringify({ destinationId: destId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.saved) {
          setFavorites((prev) => [...prev, destId]);
          showToast('Place saved to your favorites 💚');
          return true;
        } else {
          setFavorites((prev) => prev.filter((id) => id !== destId));
          showToast('Removed from your saved places.');
          return false;
        }
      }
    } catch (err) {
      console.warn('Toggle favorite error:', err);
    }
    return false;
  };

  const isFavorite = (destId: string) => favorites.includes(destId);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        favorites,
        activePage,
        pageParams,
        toastMessage,
        isChatOpen,
        setIsChatOpen,
        chatInitialPrompt,
        openChatWithPrompt,
        login,
        register,
        verifyEmail,
        resendVerificationCode,
        loginWithSocial,
        sendPasswordResetCode,
        confirmPasswordReset,
        loginAsGuest,
        logout,
        updateProfile,
        toggleFavorite,
        isFavorite,
        navigateTo,
        showToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
