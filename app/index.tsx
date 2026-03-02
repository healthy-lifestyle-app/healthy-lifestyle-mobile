import React, { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ValidRoute = "/auth/signup" | "/onboarding/welcome" | "/(tabs)/home";

export default function Index() {
  const [target, setTarget] = useState<ValidRoute | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const authDone = await AsyncStorage.getItem("auth_done");

      if (authDone !== "1") {
        setTarget("/auth/signup");
        return;
      }

      const onboardingDone = await AsyncStorage.getItem("onboarding_done");

      if (onboardingDone !== "1") {
        setTarget("/onboarding/welcome");
        return;
      }

      setTarget("/(tabs)/home");
    };

    checkStatus();
  }, []);

  if (!target) return null;

  return <Redirect href={target} />;
}