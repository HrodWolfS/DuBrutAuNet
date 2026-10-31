import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {
  CalculatorProvider,
  useCalculatorContext,
} from "../context/CalculatorContext";
import {
  ThemePreferenceProvider,
  useThemePreference,
} from "../context/ThemePreferenceContext";
import {
  SimulationsProvider,
  useSimulations,
} from "../context/SimulationsContext";

// Keep the native splash visible until prefs are loaded
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isReady: calculatorReady } = useCalculatorContext();
  const { isReady: themeReady } = useThemePreference();
  const { isReady: simulationsReady } = useSimulations();
  const isReady = calculatorReady && themeReady && simulationsReady;

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <CalculatorProvider>
        <SimulationsProvider>
          <AppContent />
        </SimulationsProvider>
      </CalculatorProvider>
    </ThemePreferenceProvider>
  );
}
