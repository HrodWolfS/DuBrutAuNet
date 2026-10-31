import AsyncStorage from "@react-native-async-storage/async-storage";
import { computeSalary } from "../../shared/salary";
import type { PersistedPrefs } from "./storage";

const STORAGE_KEY = "saved_simulations";

/** Unpinned simulations kept in the history; older ones are dropped. */
export const MAX_HISTORY = 20;
/** Offers that can be compared side by side. */
export const MAX_PINNED = 3;
export const OFFER_LETTERS = ["A", "B", "C"] as const;

export interface SavedSimulation {
  id: string;
  savedAt: number;
  /** Set while the simulation is pinned as an offer to compare. */
  pinnedAt: number | null;
  prefs: PersistedPrefs;
}

// Results are recomputed from the inputs, so saved simulations follow
// the rates shipped with the current version of the app.
export const simulate = ({ input, ...params }: PersistedPrefs) =>
  computeSalary({ ...input, ...params });

const isSavedSimulation = (value: unknown): value is SavedSimulation => {
  const sim = value as SavedSimulation;
  return (
    !!sim &&
    typeof sim.id === "string" &&
    typeof sim.savedAt === "number" &&
    (sim.pinnedAt === null || typeof sim.pinnedAt === "number") &&
    !!sim.prefs &&
    typeof sim.prefs.status === "string" &&
    !!sim.prefs.input
  );
};

export const samePrefs = (a: PersistedPrefs, b: PersistedPrefs) =>
  JSON.stringify(a) === JSON.stringify(b);

/** Keeps every pinned offer and the most recent unpinned simulations. */
export const trimHistory = (sims: SavedSimulation[]) => {
  let unpinned = 0;
  return sims.filter((sim) => sim.pinnedAt !== null || ++unpinned <= MAX_HISTORY);
};

export async function loadSimulations(): Promise<SavedSimulation[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isSavedSimulation) : [];
  } catch {
    return [];
  }
}

export async function saveSimulations(sims: SavedSimulation[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sims));
  } catch {
    // Silently ignore write errors (storage full, permissions, etc.)
  }
}
