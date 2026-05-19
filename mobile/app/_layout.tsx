import { Stack } from "expo-router";
import { CalculatorProvider } from "../context/CalculatorContext";

export default function RootLayout() {
  return (
    <CalculatorProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </CalculatorProvider>
  );
}
