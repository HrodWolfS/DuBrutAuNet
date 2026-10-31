import { InfoCard } from "@/components/InfoCard";
import {
  formatFrenchDate,
  PRIVACY_POLICY,
  PRIVACY_UPDATED,
} from "@/shared/legal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité | Du Brut au Net",
  description:
    "Du Brut au Net ne collecte aucune donnée personnelle : ni compte, ni publicité, ni traceur.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto my-12 space-y-4 px-4">
      <h1 className="text-2xl font-bold">Politique de confidentialité</h1>
      <p className="text-sm text-muted-foreground">
        Dernière mise à jour : {formatFrenchDate(PRIVACY_UPDATED)}
      </p>
      {PRIVACY_POLICY.map((section) => (
        <InfoCard key={section.title} title={section.title}>
          {section.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </InfoCard>
      ))}
    </div>
  );
}
