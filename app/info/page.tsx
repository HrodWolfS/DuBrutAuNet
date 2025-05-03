"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function InfoPage() {
  return (
    <div className="max-w-4xl mx-auto my-12 space-y-2 px-4">
      <p className="text-sm text-muted-foreground">
        Données valables au 1er mai 2025.
      </p>
      <Card
        className="rounded-3xl shadow-md border-none overflow-hidden relative p-2 sm:p-3 pb-2"
        style={{
          boxShadow:
            "var(--shadow-lg), inset 2px 2px 10px 2px rgba(255, 255, 255, 0.1)",
        }}
      >
        <CardHeader className="pb-1">
          <CardTitle className="text-lg font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--chart-4)] bg-clip-text text-transparent">
            Comment ça marche&nbsp;?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Nous utilisons une formule simple pour estimer votre salaire net :
          </p>
          <pre className="bg-muted p-4 rounded">
            <code>Net = Brut × (1 – taux global de cotisations)</code>
          </pre>
          <p>
            Le <em>taux global</em> est défini par statut (non-cadre, cadre,
            etc.) et s&apos;applique uniformément sur votre salaire brut. Cette
            approche privilégie la lisibilité et la rapidité de calcul.
          </p>
          <p>
            Ensuite, l’impôt sur le revenu est appliqué selon votre taux
            personnalisé :
            <a
              href="https://www.service-public.fr/particuliers/vosdroits/F1417"
              target="_blank"
              rel="noreferrer noopener"
              className="text-primary underline"
            >
              Service-Public.fr – Impôt sur le revenu
            </a>
            .
          </p>
        </CardContent>
      </Card>

      <Card
        className="rounded-3xl shadow-md border-none overflow-hidden relative p-2 sm:p-3 pb-2"
        style={{
          boxShadow:
            "var(--shadow-lg), inset 2px 2px 10px 2px rgba(255, 255, 255, 0.1)",
        }}
      >
        <CardHeader className="pb-1">
          <CardTitle className="text-lg font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--chart-4)] bg-clip-text text-transparent">
            Sources des données
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="border-b px-4 py-2 text-left">Donnée</th>
                <th className="border-b px-4 py-2 text-left">
                  Source officielle
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="even:bg-muted">
                <td className="border-b px-4 py-2">SMIC 2025</td>
                <td className="border-b px-4 py-2">
                  <a
                    className="underline"
                    href="https://www.urssaf.fr/accueil/outils-documentation/taux-baremes/montant-smic.html"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Urssaf – Montant SMIC
                  </a>
                </td>
              </tr>
              <tr className="even:bg-muted">
                <td className="border-b px-4 py-2">
                  Taux cotisations non-cadre
                </td>
                <td className="border-b px-4 py-2">
                  <a
                    className="underline"
                    href="https://www.urssaf.fr/accueil/outils-documentation/taux-baremes/taux-cotisations-secteur-prive.html"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Urssaf – Secteur privé
                  </a>
                </td>
              </tr>
              <tr className="even:bg-muted">
                <td className="border-b px-4 py-2">Taux cotisations cadre</td>
                <td className="border-b px-4 py-2">
                  <a
                    className="underline"
                    href="https://www.urssaf.fr/accueil/outils-documentation/taux-baremes/taux-cotisations-secteur-prive.html"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Urssaf – AGIRC-ARRCO
                  </a>
                </td>
              </tr>
              <tr className="even:bg-muted">
                <td className="border-b px-4 py-2">
                  Taux cotisations fonction publique
                </td>
                <td className="border-b px-4 py-2">
                  <a
                    className="underline"
                    href="https://www.urssaf.fr/accueil/outils-documentation/taux-baremes/taux-cotisations-secteur-public.html"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Urssaf – Fonction publique
                  </a>
                </td>
              </tr>
              <tr className="even:bg-muted">
                <td className="border-b px-4 py-2">Salaires moyens</td>
                <td className="border-b px-4 py-2">
                  <a
                    className="underline"
                    href="https://www.insee.fr/fr/statistiques/7457170"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Insee – Salaires moyens
                  </a>
                </td>
              </tr>
              <tr className="even:bg-muted">
                <td className="border-b px-4 py-2">Taux et barèmes Urssaf</td>
                <td className="border-b px-4 py-2">
                  <a
                    className="underline"
                    href="https://www.urssaf.fr/accueil/outils-documentation/taux-baremes.html"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Urssaf – Taux et barèmes
                  </a>
                </td>
              </tr>
              <tr className="even:bg-muted">
                <td className="border-b px-4 py-2">Impôt sur le revenu</td>
                <td className="border-b px-4 py-2">
                  <a
                    className="underline"
                    href="https://www.service-public.fr/particuliers/vosdroits/N247"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Service-Public.fr – Impôt sur le revenu
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card
        className="rounded-3xl shadow-md border-none overflow-hidden relative p-2 sm:p-3 pb-2"
        style={{
          boxShadow:
            "var(--shadow-lg), inset 2px 2px 10px 2px rgba(255, 255, 255, 0.1)",
        }}
      >
        <CardHeader className="pb-1">
          <CardTitle className="text-lg font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--chart-4)] bg-clip-text text-transparent">
            Limites et disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm italic text-muted-foreground">
            Ces estimations sont fournies à titre indicatif. Elles ne prennent
            pas en compte toutes les particularités (conventions collectives,
            exonérations, secteur d&apos;activité, frais professionnels, etc.).
            Pour un calcul précis, merci de consulter les sites officiels ou un
            expert-comptable.
          </p>
        </CardContent>
      </Card>

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
