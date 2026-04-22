import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { getOnboardingDone } from '@/lib/storage';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const [onboardingDone, setOnboardingDone] = React.useState<string | null>(null);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = React.useState(false);

  React.useEffect(() => {
    async function loadOnboardingStatus() {
      try {
        setIsCheckingOnboarding(true);
        const value = await getOnboardingDone();
        setOnboardingDone(value);
      } finally {
        setIsCheckingOnboarding(false);
      }
    }

    if (!isLoading && isAuthenticated) {
      loadOnboardingStatus();
      return;
    }

    if (!isLoading && !isAuthenticated) {
      setOnboardingDone(null);
      setIsCheckingOnboarding(false);
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading || (isAuthenticated && isCheckingOnboarding)) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  if (onboardingDone !== '1') {
    return <Redirect href="/(tabs)/onboarding" />;
  }

  return <Redirect href="/(tabs)/home" />;
}