import { create } from 'zustand';
import apiClient from '@/utils/apiClient'; // Adjust path as necessary
import { IUser as ServerIUser } from '@/server/models/User'; // For reference, avoid direct use if it has sensitive fields

// Client-side User type (excluding sensitive fields like hashedPassword)
export interface User {
  _id: string;
  name: string;
  email: string;
  roles: ('admin' | 'customer')[];
  createdAt?: Date; // Optional on client
  updatedAt?: Date; // Optional on client
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>; // Returns true on success, false on error
  register: (name: string, email: string, password: string) => Promise<boolean>; // Returns true on success
  logout: () => void;
  loadUserFromToken: () => Promise<void>;
  clearError: () => void;
}

const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      if (response.error || !response.data || !response.data.token || !response.data.user) {
        const errorMessage = response.data?.message || response.error || 'Login failed.';
        throw new Error(errorMessage);
      }

      const { token, user } = response.data;
      localStorage.setItem('authToken', token); // Use a generic name like 'authToken'
      set({ token, user, isLoading: false, error: null });
      return true;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'An unexpected error occurred during login.' });
      localStorage.removeItem('authToken'); // Clear token on failed login
      return false;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient<User>('/api/auth/register', { // API returns user object
        method: 'POST',
        body: { name, email, password },
      });

      if (response.error || !response.data) {
        const errorMessage = response.data?.message || response.error || 'Registration failed.';
        throw new Error(errorMessage);
      }
      
      // Optionally auto-login after successful registration
      // For simplicity, we'll just indicate success and let user login separately or call login action.
      // const loginSuccess = await get().login(email, password);
      // if (!loginSuccess) throw new Error("Registration succeeded but auto-login failed.");
      
      set({ isLoading: false, error: null }); // User not set here, login separately
      return true;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'An unexpected error occurred during registration.' });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    set({ token: null, user: null, isLoading: false, error: null });
    // Note: Admin panel uses 'adminAuthToken'. This store is for customer auth.
    // If a unified auth is desired later, token naming and storage needs care.
  },

  loadUserFromToken: async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      set({ isLoading: true, token }); // Set token immediately, user will follow
      try {
        const response = await apiClient<User>('/api/auth/me', { method: 'GET' }); // apiClient will use the token from localStorage
        
        if (response.error || !response.data) {
          // Token might be invalid or expired
          localStorage.removeItem('authToken');
          set({ token: null, user: null, isLoading: false });
          // console.warn('Failed to load user from token:', response.error || "No user data");
          return;
        }
        set({ user: response.data, isLoading: false, error: null });
      } catch (err: any) {
        localStorage.removeItem('authToken');
        set({ token: null, user: null, isLoading: false });
        // console.error('Error during loadUserFromToken:', err);
      }
    } else {
      // No token found, ensure state is clear if this is called explicitly post-logout
      // set({ token: null, user: null, isLoading: false }); // Already default state
    }
  },
}));

// Initialize store by trying to load user from token as soon as store is imported/used.
// This should only run once on app initialization.
if (typeof window !== 'undefined') {
    useAuthStore.getState().loadUserFromToken();
}


export default useAuthStore;
