"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function InfoPage() {
  return (
    <div className="max-w-4xl mx-auto my-12 space-y-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Comment ça marche&nbsp;?</CardTitle>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Sources des données</CardTitle>
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
                    href="https://www.insee.fr/fr/statistiques/7457170"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Insee – Salaires moyens
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Limites et disclaimer</CardTitle>
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
        <Link href="/" className="text-primary hover:underline">
          ← Retour au simulateur
        </Link>
      </p>
    </div>
  );
}
