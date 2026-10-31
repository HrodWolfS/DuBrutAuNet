/**
 * Textes légaux et informatifs partagés par le site et l'app :
 * mention d'estimation, sources, mentions légales, politique de confidentialité.
 */
import { RATES } from "../salary";

export const SITE_URL = "https://dubrutaunet.fr";
export const PRIVACY_URL = `${SITE_URL}/confidentialite`;
export const SUPPORT_URL = `${SITE_URL}/support`;
export const CONTACT_EMAIL = "contact@dubrutaunet.fr";

export const PUBLISHER = {
  name: "Rodolphe Stempfel",
  status: "Particulier, projet personnel non commercial",
  email: CONTACT_EMAIL,
};

export const HOST = {
  name: "Vercel Inc.",
  address: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
  url: "https://vercel.com",
};

export const ESTIMATE_NOTICE =
  "Estimation indicative — ne remplace pas votre bulletin de paie.";

/** "2026-06-01" → "1er juin 2026" */
export function formatFrenchDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const month = date.toLocaleDateString("fr-FR", { month: "long", timeZone: "UTC" });
  return `${d === 1 ? "1er" : d} ${month} ${y}`;
}

/** Ex. "Barème 2026 — SMIC au 1er juin 2026" */
export function ratesValidityLabel(): string {
  const year = RATES.validFrom.slice(0, 4);
  return `Barème ${year} — SMIC au ${formatFrenchDate(RATES.validFrom)}`;
}

export const METHOD_STEPS: string[] = [
  "Net avant impôt = Brut × (1 − taux global de cotisations du statut).",
  "Le taux global est la somme des cotisations salariales du statut, chacune appliquée à sa base (par exemple CSG et CRDS sur 98,25 % du brut).",
  "Net après impôt = Net avant impôt × (1 − taux de prélèvement à la source saisi).",
  "Conversions : 1 mois = 35 h × 52 / 12 à temps plein, 1 jour = 7 h. Le temps partiel réduit les heures, pas le taux horaire.",
  "Prime annuelle : saisie en brut, elle subit les cotisations puis le prélèvement à la source.",
  "Comparateur micro-entrepreneur : chiffre d'affaires = coût employeur estimé (brut × 1,45), puis cotisations URSSAF de la micro-entreprise.",
];

export const METHOD_LIMITS =
  "Le simulateur utilise un taux global par statut. Il ne tient pas compte des plafonds de la Sécurité sociale, des réductions de cotisations, des heures supplémentaires, des avantages en nature ni des conventions collectives. Les lignes marquées « estimation » (mutuelle, prévoyance) varient selon l'employeur.";

export interface Source {
  label: string;
  url: string;
}

export const SOURCES: Source[] = [
  { label: "SMIC — Service-Public.fr", url: RATES.smic.source },
  { label: "Plafond de la Sécurité sociale — Urssaf", url: RATES.pass.source },
  {
    label: "Taux de cotisations du secteur privé — Urssaf",
    url: "https://www.urssaf.fr/accueil/outils-documentation/taux-baremes/taux-cotisations-secteur-prive.html",
  },
  {
    label: "Prélèvement à la source — Service-Public.fr",
    url: "https://www.service-public.fr/particuliers/vosdroits/F34009",
  },
  {
    label: "Simulateurs officiels — mon-entreprise.urssaf.fr",
    url: "https://mon-entreprise.urssaf.fr",
  },
];

export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export const PRIVACY_UPDATED = "2026-10-30";

export const PRIVACY_POLICY: LegalSection[] = [
  {
    title: "En résumé",
    paragraphs: [
      "Du Brut au Net ne collecte aucune donnée personnelle. Il n'y a ni compte, ni publicité, ni outil de mesure d'audience, ni traceur tiers.",
    ],
  },
  {
    title: "Application iOS",
    paragraphs: [
      "Les montants et paramètres saisis (salaire, statut, temps de travail, taux d'impôt, prime) sont enregistrés uniquement sur votre appareil pour retrouver votre dernière simulation. Ils ne sont jamais transmis.",
      "Le bouton « Réinitialiser » efface ces valeurs ; la désinstallation de l'application les supprime entièrement.",
      "L'application fonctionne hors ligne et n'effectue aucune requête réseau, à l'exception des liens vers les sources officielles que vous choisissez d'ouvrir.",
    ],
  },
  {
    title: "Site dubrutaunet.fr",
    paragraphs: [
      "Les calculs sont faits dans votre navigateur ; les montants saisis ne sont pas envoyés au serveur.",
      "Seule votre préférence de thème (clair ou sombre) est enregistrée dans le stockage local de votre navigateur. Aucun cookie n'est déposé.",
      `L'hébergeur (${HOST.name}) peut conserver des journaux techniques (adresse IP, date, page demandée) pour assurer la sécurité et le bon fonctionnement du service.`,
    ],
  },
  {
    title: "Vos droits",
    paragraphs: [
      `Aucune donnée vous concernant n'étant collectée, il n'y a rien à consulter, rectifier ou supprimer de notre côté. Pour toute question : ${CONTACT_EMAIL}.`,
      "Vous pouvez aussi saisir la CNIL (cnil.fr).",
    ],
  },
];

export interface Faq {
  question: string;
  answer: string;
}

export const SUPPORT_FAQ: Faq[] = [
  {
    question: "Le résultat diffère de mon bulletin de paie, pourquoi ?",
    answer:
      "Le simulateur applique un taux global par statut. Votre bulletin dépend de votre mutuelle, de votre prévoyance, des réductions de cotisations et de votre convention collective. Comptez quelques dizaines d'euros d'écart.",
  },
  {
    question: "Quel taux d'impôt saisir ?",
    answer:
      "Votre taux de prélèvement à la source figure sur votre bulletin de paie et dans votre espace sur impots.gouv.fr.",
  },
  {
    question: "Les taux sont-ils à jour ?",
    answer:
      "Oui, ils suivent le barème indiqué dans l'écran « Méthode & sources ». Le SMIC est revérifié à chaque revalorisation.",
  },
  {
    question: "Comment effacer mes données ?",
    answer:
      "Dans l'application, touchez « Réinitialiser ». La désinstallation supprime aussi toutes les valeurs enregistrées.",
  },
];
