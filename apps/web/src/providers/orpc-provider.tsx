'use client';

import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { orpc } from '../lib/orpc';
import { useAuthStore } from '../lib/auth.store';
import { Toaster } from "@repo/ui/components/ui/sonner"
import { UserResponseSchema } from '@repo/contract';

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  // Initial Session Check
  const { data, isLoading, error } = useQuery({
    ...orpc.user.profile.me.queryOptions({
      input: {}, // Empty input for "me" endpoint
    }),
    retry: false, // Don't retry if 401
  });

  useEffect(() => {
      setLoading(isLoading);
      if (data?.status === 'success') {
          // Parse data to coerce Date strings to Date objects
          setUser(data.data);
      } else if (error) {
          setUser(null);
      }
  }, [data, isLoading, error, setUser, setLoading]);

  return <>{children}</>;
}

export function ORPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1, // Don't retry indefinitely
            staleTime: 5 * 1000, // 5 seconds
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthWrapper>{children}</AuthWrapper>
      <Toaster />
    </QueryClientProvider>
  );
}
