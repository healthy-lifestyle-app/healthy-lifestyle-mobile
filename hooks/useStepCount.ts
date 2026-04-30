import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Pedometer } from 'expo-sensors';

export function useStepCount() {
  const [steps, setSteps] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const subscriptionRef = useRef<{ remove: () => void } | null>(null);

  const loadSteps = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        setIsAvailable(false);
        setHasPermission(false);
        setSteps(0);
        return;
      }

      const available = await Pedometer.isAvailableAsync();
      setIsAvailable(available);

      if (!available) {
        setHasPermission(false);
        setSteps(0);
        return;
      }

      const currentPermission = await Pedometer.getPermissionsAsync();

      let granted = currentPermission.granted;

      if (!granted && currentPermission.canAskAgain) {
        const requestedPermission = await Pedometer.requestPermissionsAsync();
        granted = requestedPermission.granted;
      }

      setHasPermission(granted);

      if (!granted) {
        setSteps(0);
        return;
      }

      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
      );

      const result = await Pedometer.getStepCountAsync(startOfDay, now);

      setSteps(result.steps ?? 0);
    } catch (error) {
      console.log('STEP_COUNT_ERROR', error);
      setIsAvailable(false);
      setHasPermission(false);
      setSteps(0);
    }
  }, []);

  useEffect(() => {
    loadSteps();

    if (Platform.OS === 'web') {
      return;
    }

    subscriptionRef.current = Pedometer.watchStepCount(() => {
      loadSteps();
    });

    return () => {
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, [loadSteps]);

  return {
    steps,
    isAvailable,
    hasPermission,
    refreshSteps: loadSteps,
  };
}