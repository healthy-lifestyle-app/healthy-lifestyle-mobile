import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Pedometer } from 'expo-sensors';

export function useStepCount() {
  const [steps, setSteps] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);

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
        setSteps(0);
        return;
      }

      const permission = await Pedometer.requestPermissionsAsync();

      if (!permission.granted) {
        setHasPermission(false);
        setSteps(0);
        return;
      }

      setHasPermission(true);

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
      setSteps(0);
    }
  }, []);

  useEffect(() => {
    loadSteps();

    if (Platform.OS === 'web') {
      return;
    }

    let subscription: { remove: () => void } | null = null;

    const startWatching = async () => {
      try {
        const available = await Pedometer.isAvailableAsync();

        if (!available) {
          return;
        }

        subscription = Pedometer.watchStepCount((result) => {
          setSteps((prev) => prev + (result.steps ?? 0));
        });
      } catch (error) {
        console.log('STEP_WATCH_ERROR', error);
      }
    };

    startWatching();

    return () => {
      subscription?.remove();
    };
  }, [loadSteps]);

  return {
    steps,
    isAvailable,
    hasPermission,
    refreshSteps: loadSteps,
  };
}