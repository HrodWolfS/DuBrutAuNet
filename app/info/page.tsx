import { InfoCard } from "@/components/InfoCard";
import {
  METHOD_LIMITS,
  METHOD_STEPS,
  ratesValidityLabel,
  SOURCES,
} from "@/shared/legal";
import { employeeRate, RATES, STATUSES } from "@/shared/salary";
import Link from "next/link";

export { metadata } from "./metadata";

const formatPercent = (rate: number) =>
  `${(rate * 100).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} %`;

export default function InfoPage() {
  return (
    <div className="max-w-4xl mx-auto my-12 space-y-2 px-4">
      <p className="text-sm text-muted-foreground">{ratesValidityLabel()}.</p>

      <InfoCard title="Comment ça marche ?">
        <pre className="bg-muted p-4 rounded whitespace-pre-wrap">
          <code>Net = Brut × (1 – taux global de cotisations)</code>
        </pre>
        <ul className="list-disc pl-5 space-y-2">
          {METHOD_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </InfoCard>

      <InfoCard title="Taux appliqués">
        <table className="w-full table-auto border-collapse">
          <tbody>
            {STATUSES.map((status) => (
              <tr key={status} className="even:bg-muted">
                <td className="border-b px-4 py-2">
                  {RATES.statuses[status].title}
                </td>
                <td className="border-b px-4 py-2 text-right whitespace-nowrap">
                  {formatPercent(employeeRate(status))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </InfoCard>

      <InfoCard title="Sources officielles">
        <ul className="space-y-2">
          {SOURCES.map((source) => (
            <li key={source.url}>
              <a
                className="underline"
                href={source.url}
                target="_blank"
                rel="noreferrer noopener"
              >
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </InfoCard>

      <InfoCard title="Limites et disclaimer">
        <p className="text-sm italic text-muted-foreground">{METHOD_LIMITS}</p>
        <p className="text-sm italic text-muted-foreground">
          Ces estimations sont fournies à titre indicatif. Pour un calcul
          précis, consultez les sites officiels ou un expert-comptable.
        </p>
      </InfoCard>

      <p className="mt-8 text-center">
        <Link
          href="/"
          className="font-bold bg-gradient-to-l from-[var(--primary)] to-[var(--chart-4)] bg-clip-text text-transparent hover:underline"
        >
          ← Retour au simulateur
        </Link>
      </p>
    </div>
  );
}
