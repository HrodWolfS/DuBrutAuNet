import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemePreference = "auto" | "light" | "dark";

const STORAGE_KEY = "theme_preference";

const isThemePreference = (value: unknown): value is ThemePreference =>
  value === "auto" || value === "light" || value === "dark";

// Overriding the app-wide scheme keeps every useColorScheme() call in sync.
const apply = (preference: ThemePreference) =>
  Appearance.setColorScheme(preference === "auto" ? null : preference);

interface ThemePreferenceContextValue {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  isReady: boolean;
}

const ThemePreferenceContext =
  createContext<ThemePreferenceContextValue | null>(null);

export function ThemePreferenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preference, setPreferenceState] = useState<ThemePreference>("auto");
  const [isReady, setIsReady] = useState(false);

  // Restore before the splash hides so the first paint uses the saved theme.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (isThemePreference(saved)) {
          apply(saved);
          setPreferenceState(saved);
        }
      })
      .catch(() => {})
      .finally(() => setIsReady(true));
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    apply(next);
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  return (
    <ThemePreferenceContext.Provider
      value={{ preference, setPreference, isReady }}
    >
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference(): ThemePreferenceContextValue {
  const ctx = useContext(ThemePreferenceContext);
  if (!ctx) {
    throw new Error(
      "useThemePreference must be used inside ThemePreferenceProvider",
    );
  }
  return ctx;
}
