import { InfoCard } from "@/components/InfoCard";
import { HOST, PUBLISHER } from "@/shared/legal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales | Du Brut au Net",
};

export default function LegalNoticePage() {
  return (
    <div className="max-w-4xl mx-auto my-12 space-y-4 px-4">
      <h1 className="text-2xl font-bold">Mentions légales</h1>
      <InfoCard title="Éditeur">
        <p>{PUBLISHER.name}</p>
        <p className="text-muted-foreground">{PUBLISHER.status}</p>
        <p>
          Contact :{" "}
          <a className="text-primary underline" href={`mailto:${PUBLISHER.email}`}>
            {PUBLISHER.email}
          </a>
        </p>
        <p>Directeur de la publication : {PUBLISHER.name}</p>
      </InfoCard>
      <InfoCard title="Hébergeur">
        <p>{HOST.name}</p>
        <p className="text-muted-foreground">{HOST.address}</p>
        <a className="text-primary underline" href={HOST.url}>
          {HOST.url}
        </a>
      </InfoCard>
      <InfoCard title="Responsabilité">
        <p>
          Les résultats sont des estimations fournies à titre indicatif, sans
          garantie. Ils ne remplacent ni un bulletin de paie ni l&apos;avis
          d&apos;un professionnel.
        </p>
      </InfoCard>
    </div>
  );
}
