import React, { createContext, useContext } from "react";
import {
  useCalculator,
  CalculatorState,
  CalculatorHandlers,
} from "../lib/hooks/useCalculator";

interface CalculatorContextValue {
  state: CalculatorState;
  handlers: CalculatorHandlers;
}

const CalculatorContext = createContext<CalculatorContextValue | null>(null);

export function CalculatorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, handlers] = useCalculator();

  return (
    <CalculatorContext.Provider value={{ state, handlers }}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculatorContext(): CalculatorContextValue {
  const ctx = useContext(CalculatorContext);
  if (!ctx) {
    throw new Error(
      "useCalculatorContext must be used within a CalculatorProvider",
    );
  }
  return ctx;
}
