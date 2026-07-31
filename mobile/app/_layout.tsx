import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/features/auth/store/authStore';
import { useOnboardingStore } from '../src/features/onboarding/store/onboardingStore';
import '../src/global.css';

const queryClient = new QueryClient();

function InitialLayout() {
  const { token, isLoading: authLoading, restoreToken } = useAuthStore();
  const { hasCompletedOnboarding, isLoading: onboardingLoading, checkOnboardingStatus } = useOnboardingStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    restoreToken();
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (authLoading || onboardingLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!token && !inAuthGroup) {
      // Redirect to the sign-in page.
      router.replace('/(auth)/login');
    } else if (token) {
      if (!hasCompletedOnboarding && !inOnboardingGroup) {
        router.replace('/(onboarding)/welcome');
      } else if (hasCompletedOnboarding && (inAuthGroup || inOnboardingGroup)) {
        router.replace('/');
      }
    }
  }, [token, hasCompletedOnboarding, authLoading, onboardingLoading, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <InitialLayout />
    </QueryClientProvider>
  );
}
