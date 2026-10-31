import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PersistedPrefs } from "../lib/storage";
import {
  loadSimulations,
  MAX_PINNED,
  samePrefs,
  saveSimulations,
  trimHistory,
  type SavedSimulation,
} from "../lib/simulations";

interface SimulationsContextValue {
  /** Newest first. */
  simulations: SavedSimulation[];
  /** In pinning order: offer A, B, C. */
  offers: SavedSimulation[];
  /** Saves the inputs, or returns the latest one when they are unchanged. */
  save: (prefs: PersistedPrefs) => SavedSimulation;
  remove: (id: string) => void;
  /** Returns false when MAX_PINNED offers are already pinned. */
  togglePin: (id: string) => boolean;
  isReady: boolean;
}

const SimulationsContext = createContext<SimulationsContextValue | null>(null);

export function SimulationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [simulations, setSimulations] = useState<SavedSimulation[]>([]);
  const [isReady, setIsReady] = useState(false);
  // Mirrors the state so handlers can return a result synchronously.
  const current = useRef<SavedSimulation[]>([]);

  useEffect(() => {
    loadSimulations().then((saved) => {
      current.current = saved;
      setSimulations(saved);
      setIsReady(true);
    });
  }, []);

  const commit = useCallback((next: SavedSimulation[]) => {
    current.current = next;
    setSimulations(next);
    saveSimulations(next);
  }, []);

  const save = useCallback(
    (prefs: PersistedPrefs) => {
      const [latest] = current.current;
      if (latest && samePrefs(latest.prefs, prefs)) return latest;
      const sim: SavedSimulation = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        savedAt: Date.now(),
        pinnedAt: null,
        prefs,
      };
      commit(trimHistory([sim, ...current.current]));
      return sim;
    },
    [commit],
  );

  const remove = useCallback(
    (id: string) => commit(current.current.filter((sim) => sim.id !== id)),
    [commit],
  );

  const togglePin = useCallback(
    (id: string) => {
      const sims = current.current;
      const target = sims.find((sim) => sim.id === id);
      if (!target) return false;
      const pinnedCount = sims.filter((sim) => sim.pinnedAt !== null).length;
      if (target.pinnedAt === null && pinnedCount >= MAX_PINNED) return false;
      const pinnedAt = target.pinnedAt === null ? Date.now() : null;
      commit(
        trimHistory(
          sims.map((sim) => (sim.id === id ? { ...sim, pinnedAt } : sim)),
        ),
      );
      return true;
    },
    [commit],
  );

  const offers = useMemo(
    () =>
      simulations
        .filter((sim) => sim.pinnedAt !== null)
        .sort((a, b) => (a.pinnedAt ?? 0) - (b.pinnedAt ?? 0)),
    [simulations],
  );

  return (
    <SimulationsContext.Provider
      value={{ simulations, offers, save, remove, togglePin, isReady }}
    >
      {children}
    </SimulationsContext.Provider>
  );
}

export function useSimulations(): SimulationsContextValue {
  const ctx = useContext(SimulationsContext);
  if (!ctx) {
    throw new Error("useSimulations must be used inside SimulationsProvider");
  }
  return ctx;
}
