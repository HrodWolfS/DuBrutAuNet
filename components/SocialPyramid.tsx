"use client";

interface Benchmark {
  label: string;
  value: number;
}

const BENCHMARKS: readonly Benchmark[] = [
  { label: "SMIC Net", value: 1398 },
  { label: "Médian", value: 2100 },
  { label: "Moyen", value: 2600 },
  { label: "Top 10%", value: 4000 },
] as const;

const SCALE_MAX = 4000;

function toPercent(value: number): number {
  return Math.min((value / SCALE_MAX) * 100, 100);
}

interface SocialPyramidProps {
  mensuelNet: number;
}

export function SocialPyramid({ mensuelNet }: SocialPyramidProps) {
  if (mensuelNet <= 0) return null;

  const pct = toPercent(mensuelNet);
  // Clamp label left to prevent overflow at edges
  const labelLeft = Math.min(Math.max(pct, 6), 94);
  const isAboveScale = mensuelNet > SCALE_MAX;

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 px-2 sm:px-0">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-5 text-center">
        Votre position salariale en France
      </p>

      <div className="relative">
        {/* "Vous" label — above the bar */}
        <div className="h-7 relative mb-1">
          <div
            className="absolute bottom-0 -translate-x-1/2 text-center transition-all duration-500 ease-out pointer-events-none"
            style={{ left: `${labelLeft}%` }}
          >
            <span className="text-[10px] font-bold text-primary whitespace-nowrap">
              Vous ·{" "}
              {mensuelNet.toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0,
              })}
              {isAboveScale ? " +" : ""}
            </span>
          </div>
        </div>

        {/* Bar row */}
        <div className="relative h-2">
          {/* Track */}
          <div className="absolute inset-0 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-primary transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Cursor dot */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-primary border-2 border-background rounded-full shadow-sm z-10 transition-all duration-500 ease-out"
            style={{ left: `${pct}%` }}
          />

          {/* Benchmark tick marks */}
          {BENCHMARKS.map(({ label, value }) => {
            const bPct = (value / SCALE_MAX) * 100;
            return (
              <div
                key={label}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-px h-4 bg-border"
                style={{ left: `${bPct}%` }}
              />
            );
          })}
        </div>

        {/* Benchmark labels — below the bar */}
        <div className="relative h-10 mt-2">
          {BENCHMARKS.map(({ label, value }, i) => {
            const bPct = (value / SCALE_MAX) * 100;
            const isLast = i === BENCHMARKS.length - 1;
            return (
              <div
                key={label}
                className={`absolute text-center ${isLast ? "-translate-x-full" : "-translate-x-1/2"}`}
                style={{ left: `${bPct}%` }}
              >
                <p className="text-[9px] text-muted-foreground/60 leading-tight font-medium">
                  {label}
                </p>
                <p className="text-[9px] text-muted-foreground/50">
                  {value.toLocaleString("fr-FR")} €
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
