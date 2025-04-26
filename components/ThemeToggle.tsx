"use client";

export function ThemeToggle() {
  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      className="rounded-full border p-2 hover:bg-accent transition"
      onClick={() => {
        const html = document.documentElement;
        html.classList.toggle("dark");
        localStorage.setItem(
          "theme",
          html.classList.contains("dark") ? "dark" : "light"
        );
      }}
    >
      <span className="inline-block w-6 h-6">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 7.07-1.41-1.41M6.34 6.34 4.93 4.93m12.02 0-1.41 1.41M6.34 17.66l-1.41 1.41" />
        </svg>
      </span>
    </button>
  );
}
