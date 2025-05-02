"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (typeof document !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, []);

  const handleToggle = () => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    html.classList.toggle("dark");
    localStorage.setItem(
      "theme",
      html.classList.contains("dark") ? "dark" : "light"
    );
    setIsDark(html.classList.contains("dark"));
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
          {mounted ? (
            isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )
          ) : null}
        </span>
      </button>
    </div>
  );
}
