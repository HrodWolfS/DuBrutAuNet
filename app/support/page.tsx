import { InfoCard } from "@/components/InfoCard";
import { CONTACT_EMAIL, SUPPORT_FAQ } from "@/shared/legal";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support | Du Brut au Net",
  description:
    "Aide et contact pour le simulateur et l'application Du Brut au Net.",
};

export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto my-12 space-y-4 px-4">
      <h1 className="text-2xl font-bold">Support</h1>
      <InfoCard title="Nous contacter">
        <p>
          Une question, une erreur de calcul, une suggestion ? Écrivez à{" "}
          <a className="text-primary underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          . Réponse sous quelques jours.
        </p>
      </InfoCard>
      <InfoCard title="Questions fréquentes">
        {SUPPORT_FAQ.map((faq) => (
          <div key={faq.question}>
            <p className="font-semibold">{faq.question}</p>
            <p className="text-muted-foreground">{faq.answer}</p>
          </div>
        ))}
      </InfoCard>
      <p className="text-sm text-muted-foreground">
        Voir aussi{" "}
        <Link className="underline" href="/info">
          la méthode de calcul
        </Link>{" "}
        et{" "}
        <Link className="underline" href="/confidentialite">
          la politique de confidentialité
        </Link>
        .
      </p>
    </div>
  );
}
