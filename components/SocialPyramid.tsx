"use client";

import { BarChart2 } from "lucide-react";
import { useState } from "react";

interface Benchmark {
  label: string;
  value: number;
}

const BENCHMARKS: readonly Benchmark[] = [
  { label: "SMIC Net", value: 1398 },
  { label: "Médian", value: 2100 },
  { label: "Moyen", value: 2600 },
  { label: "Top 10%", value: 4000 },
  { label: "Top 1%", value: 7000 },
] as const;

const SCALE_MAX = 7000;

/**
 * Approximation de la distribution des salaires nets mensuels en France.
 * Données inspirées des percentiles INSEE (enquête emploi / DADS).
 * density = densité relative (valeur arbitraire, normalisée à l'affichage).
 */
const DISTRIBUTION: { salary: number; density: number }[] = [
  { salary: 0, density: 0 },
  { salary: 400, density: 0.3 },
  { salary: 700, density: 1.2 },
  { salary: 950, density: 3.2 },
  { salary: 1150, density: 5.8 },
  { salary: 1300, density: 8.5 },
  { salary: 1398, density: 10.2 }, // SMIC
  { salary: 1550, density: 12.1 },
  { salary: 1750, density: 13.5 },
  { salary: 1950, density: 14.0 }, // pic de densité
  { salary: 2100, density: 13.0 }, // médian
  { salary: 2300, density: 11.0 },
  { salary: 2550, density: 8.8 },
  { salary: 2900, density: 6.2 },
  { salary: 3300, density: 4.0 },
  { salary: 3800, density: 2.5 },
  { salary: 4500, density: 1.4 },
  { salary: 5500, density: 0.65 },
  { salary: 6500, density: 0.25 },
  { salary: 7000, density: 0.1 },
];

const CHART_W = 1000;
const CHART_H = 80;

/** Cubic-bezier smoothing — contrôle 35% de la distance horizontale */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  const d: string[] = [`M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const dx = (b.x - a.x) * 0.35;
    d.push(
      `C ${(a.x + dx).toFixed(1)},${a.y.toFixed(1)} ${(b.x - dx).toFixed(1)},${b.y.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`,
    );
  }
  return d.join(" ");
}

/** Interpolation linéaire de la densité pour un salaire donné */
function interpolateDensity(salary: number): number {
  const s = Math.min(salary, SCALE_MAX);
  for (let i = 0; i < DISTRIBUTION.length - 1; i++) {
    const a = DISTRIBUTION[i];
    const b = DISTRIBUTION[i + 1];
    if (s >= a.salary && s <= b.salary) {
      const t = (s - a.salary) / (b.salary - a.salary);
      return a.density + t * (b.density - a.density);
    }
  }
  return 0;
}

function toPercent(value: number): number {
  return Math.min((value / SCALE_MAX) * 100, 100);
}

interface SocialPyramidProps {
  mensuelNet: number;
}

export function SocialPyramid({ mensuelNet }: SocialPyramidProps) {
  const [showChart, setShowChart] = useState(false);

  if (mensuelNet <= 0) return null;

  const pct = toPercent(mensuelNet);
  const labelLeft = Math.min(Math.max(pct, 6), 94);
  const isAboveScale = mensuelNet > SCALE_MAX;

  /* ── Calculs pour le graphique ── */
  const maxDensity = Math.max(...DISTRIBUTION.map((d) => d.density));

  const chartPts = DISTRIBUTION.map(({ salary, density }) => ({
    x: (salary / SCALE_MAX) * CHART_W,
    y: CHART_H - (density / maxDensity) * CHART_H,
  }));

  const linePath = smoothPath(chartPts);
  const areaPath = [
    linePath,
    `L ${chartPts[chartPts.length - 1].x.toFixed(1)},${CHART_H}`,
    `L ${chartPts[0].x.toFixed(1)},${CHART_H}`,
    "Z",
  ].join(" ");

  const userX = Math.min((mensuelNet / SCALE_MAX) * CHART_W, CHART_W);
  const userDensity = interpolateDensity(mensuelNet);
  const userDotY = CHART_H - (userDensity / maxDensity) * CHART_H;

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 px-2 sm:px-0">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-5 text-center">
        Votre position salariale en France
      </p>

      <div className="relative">
        {/* ── "Vous" label au-dessus de la barre ── */}
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

        {/* ── Barre de progression ── */}
        <div className="relative h-2">
          <div className="absolute inset-0 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-primary transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-primary border-2 border-background rounded-full shadow-sm z-10 transition-all duration-500 ease-out"
            style={{ left: `${pct}%` }}
          />
          {BENCHMARKS.map(({ label, value }) => (
            <div
              key={label}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-px h-4 bg-border"
              style={{ left: `${(value / SCALE_MAX) * 100}%` }}
            />
          ))}
        </div>

        {/* ── Étiquettes des repères ── */}
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

        {/* ── Bouton toggle graphique ── */}
        <div className="flex justify-center mt-5">
          <button
            onClick={() => setShowChart((v) => !v)}
            className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-150"
          >
            <BarChart2 className="w-3 h-3" />
            <span>
              {showChart
                ? "Masquer la distribution"
                : "Voir la distribution de la population"}
            </span>
          </button>
        </div>

        {/* ── Graphique de distribution ── */}
        {showChart && (
          <div className="mt-3 animate-in fade-in duration-300">
            <div className="relative">
              {/* Étiquette axe Y */}
              <span className="absolute -left-1 top-0 text-[8px] text-muted-foreground/35 leading-none pointer-events-none select-none">
                ↑ densité
              </span>

              <svg
                viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                className="w-full overflow-visible"
                style={{ height: "90px" }}
                aria-label="Distribution des salaires nets en France"
              >
                <defs>
                  <linearGradient
                    id="pyramidGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--primary)"
                      stopOpacity="0.13"
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--primary)"
                      stopOpacity="0.01"
                    />
                  </linearGradient>
                </defs>

                {/* Ligne de base */}
                <line
                  x1="0"
                  y1={CHART_H}
                  x2={CHART_W}
                  y2={CHART_H}
                  stroke="var(--border)"
                  strokeWidth="0.8"
                  strokeOpacity="0.5"
                />

                {/* Repères verticaux en filigrane */}
                {BENCHMARKS.map(({ label, value }) => (
                  <line
                    key={label}
                    x1={(value / SCALE_MAX) * CHART_W}
                    y1="0"
                    x2={(value / SCALE_MAX) * CHART_W}
                    y2={CHART_H}
                    stroke="var(--border)"
                    strokeWidth="0.6"
                    strokeOpacity="0.4"
                    strokeDasharray="3 4"
                  />
                ))}

                {/* Remplissage sous la courbe */}
                <path d={areaPath} fill="url(#pyramidGradient)" />

                {/* Courbe de distribution */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="1.5"
                  strokeOpacity="0.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Ligne verticale utilisateur */}
                <line
                  x1={userX}
                  y1="0"
                  x2={userX}
                  y2={CHART_H}
                  stroke="var(--primary)"
                  strokeWidth="1.5"
                  strokeDasharray="5 3"
                  strokeOpacity="0.75"
                />

                {/* Point utilisateur sur la courbe */}
                <circle
                  cx={userX}
                  cy={userDotY}
                  r="4"
                  fill="var(--primary)"
                  fillOpacity="0.9"
                  stroke="white"
                  strokeWidth="1.5"
                />
              </svg>
            </div>

            {/* Légende */}
            <p className="text-[9px] text-muted-foreground/40 text-right mt-1">
              Distribution approximative des salaires nets · Source : INSEE
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
