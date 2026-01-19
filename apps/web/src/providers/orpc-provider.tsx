'use client';

import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { orpc } from '../lib/orpc';
import { useAuthStore } from '../lib/auth.store';
import { Toaster } from "@repo/ui/components/ui/sonner"

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  // Initial Session Check
  const { data, isLoading, error } = useQuery({
    ...orpc.user.profile.me.queryOptions({
      input: {}, // Empty input for "me" endpoint
    }),
    retry: false,
  });

  useEffect(() => {
      setLoading(isLoading);
      if (data?.status === 'success') {
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
            retry: 1,
            staleTime: 5 * 1000,
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
