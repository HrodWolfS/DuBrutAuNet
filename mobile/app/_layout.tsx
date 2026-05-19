import { Stack } from "expo-router";
import { CalculatorProvider } from "../context/CalculatorContext";
import { useCalculatorContext } from "../context/CalculatorContext";

function AppContent() {
  const { isReady } = useCalculatorContext();
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
