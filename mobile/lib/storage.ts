import AsyncStorage from "@react-native-async-storage/async-storage";
import type { InputState, StatusType } from "./hooks/useCalculator";

const STORAGE_KEY = "calculator_prefs";

export interface PersistedPrefs {
  input: InputState;
  status: StatusType;
  taxRate: number;
  workPercent: number;
  prime: number;
}

export async function loadPrefs(): Promise<PersistedPrefs | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedPrefs;
    // Basic validation — ensure required keys exist
    if (
      parsed &&
      typeof parsed.status === "string" &&
      typeof parsed.taxRate === "number" &&
      typeof parsed.workPercent === "number" &&
      typeof parsed.prime === "number" &&
      parsed.input &&
      typeof parsed.input.direction === "string" &&
      typeof parsed.input.period === "string"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export async function savePrefs(prefs: PersistedPrefs): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Silently ignore write errors (storage full, permissions, etc.)
  }
}

export async function clearPrefs(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently ignore
  }
}
