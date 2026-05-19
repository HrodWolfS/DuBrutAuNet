import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { CalculatorProvider } from "../context/CalculatorContext";
import { useCalculatorContext } from "../context/CalculatorContext";

// Keep the native splash visible until prefs are loaded
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isReady } = useCalculatorContext();

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
    <CalculatorProvider>
      <AppContent />
    </CalculatorProvider>
  );
}
