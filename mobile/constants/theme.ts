export type ColorScheme = "light" | "dark";

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  primary: string;
  secondary: string;
  muted: string;
  mutedForeground: string;
  border: string;
  primaryForeground: string;
  white: string;
}

export const lightColors: ThemeColors = {
  background: "#F8FAFC",
  foreground: "#0F172A",
  card: "#FFFFFF",
  primary: "#16A34A",
  secondary: "#F1F5F9",
  muted: "#F1F5F9",
  mutedForeground: "#64748B",
  border: "#E2E8F0",
  primaryForeground: "#FFFFFF",
  white: "#FFFFFF",
};

export const darkColors: ThemeColors = {
  background: "#0B1120",
  foreground: "#F1F5F9",
  card: "#131D2E",
  primary: "#22C55E",
  secondary: "#1E2D3D",
  muted: "#1E2D3D",
  mutedForeground: "#7A8FA6",
  border: "#1E2D3D",
  primaryForeground: "#FFFFFF",
  white: "#FFFFFF",
};

export function getTheme(scheme: ColorScheme | null | undefined): ThemeColors {
  return scheme === "dark" ? darkColors : lightColors;
}
