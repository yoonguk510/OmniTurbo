import { create } from 'zustand';
import { produce } from 'immer';
import { UserResponseSchema } from '@repo/contract';
import z from 'zod';

type User = z.infer<typeof UserResponseSchema>;

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading until we verify session

  setUser: (user) =>
    set(
      produce((state: AuthState) => {
        state.user = user;
        state.isAuthenticated = !!user;
        state.isLoading = false;
      })
    ),

  setLoading: (isLoading) =>
    set(
      produce((state: AuthState) => {
        state.isLoading = isLoading;
      })
    ),

  logout: () =>
    set(
      produce((state: AuthState) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      })
    ),
}));
