"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

// La classe "dark" sur <html> est la source de vérité (posée avant l'hydratation)
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

const getIsDark = () => document.documentElement.classList.contains("dark");
// Côté serveur le thème est inconnu : on n'affiche pas d'icône
const getServerIsDark = () => null;

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getIsDark, getServerIsDark);

  const handleToggle = () => {
    const html = document.documentElement;
    html.classList.toggle("dark");
    localStorage.setItem(
      "theme",
      html.classList.contains("dark") ? "dark" : "light"
    );
  };

  return (
    <div className="relative group">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--chart-4)] opacity-70 group-hover:opacity-100 transition-opacity"></div>
      <button
        type="button"
        aria-label="Toggle dark mode"
        className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-background m-[1px] group-hover:bg-background/90 transition-colors"
        onClick={handleToggle}
      >
        <span className="flex items-center justify-center">
          {isDark === null ? null : isDark ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </span>
      </button>
    </div>
  );
}
