import axios from "axios";
import * as cheerio from "cheerio";
import { writeFileSync } from "fs";
import { join } from "path";

interface RateTable {
  lastUpdate: string;
  smic: {
    hourly: number;
    monthly: number;
  };
  rates: {
    NON_CADRE: { employee: number };
    CADRE: { employee: number };
    FONCTION_PUBLIQUE: { employee: number };
    PORTAGE_SALARIAL: { employee: number };
    AUTO_ENTREPRENEUR: { employee: number };
    PROFESSION_LIBERALE: { employee: number };
  };
}

const SMIC_URL =
  "https://www.urssaf.fr/accueil/outils-documentation/taux-baremes/montant-smic.html";
const AUTO_URL = "https://entreprendre.service-public.fr/vosdroits/F36232";

async function fetchSmic() {
  const html = await axios.get(SMIC_URL).then((r) => r.data);
  const $ = cheerio.load(html);
  const hourlyMatch = $("table")
    .first()
    .text()
    .match(/(\d{1,2},\d{2})/);
  if (!hourlyMatch) throw new Error("SMIC horaire introuvable");
  const hourly = parseFloat(hourlyMatch[1].replace(",", "."));
  return { hourly, monthly: +(hourly * 151.67).toFixed(2) };
}

async function fetchAutoEntrepreneur() {
  const html = await axios.get(AUTO_URL).then((r) => r.data);
  const $ = cheerio.load(html);
  const servicesMatch = $("h3:contains('prestation de services')")
    .nextUntil("h3")
    .text()
    .match(/(\d{1,2},\d)%/);
  if (!servicesMatch)
    throw new Error("Taux micro-entrepreneur (services) introuvable");
  const services = parseFloat(servicesMatch[1].replace(",", ".")) / 100;
  const liberaleMatch = $("h3:contains('Activité libérale hors Cipav')")
    .nextUntil("h3")
    .text()
    .match(/(\d{1,2},\d)%/);
  if (!liberaleMatch)
    throw new Error("Taux micro-entrepreneur (libéral) introuvable");
  const liberale = parseFloat(liberaleMatch[1].replace(",", ".")) / 100;
  return { services, liberale };
}

async function fetchSalaryRates() {
  // TODO: Scraper la table CSV Urssaf pour les statuts classiques
  return {
    NON_CADRE: { employee: 0.22 },
    CADRE: { employee: 0.22 },
    FONCTION_PUBLIQUE: { employee: 0.15 },
    PORTAGE_SALARIAL: { employee: 0.22 },
  };
}

async function fetchRates(): Promise<RateTable> {
  const [smic, auto, classic] = await Promise.all([
    fetchSmic(),
    fetchAutoEntrepreneur(),
    fetchSalaryRates(),
  ]);

  return {
    lastUpdate: new Date().toISOString(),
    smic,
    rates: {
      NON_CADRE: classic.NON_CADRE,
      CADRE: classic.CADRE,
      FONCTION_PUBLIQUE: classic.FONCTION_PUBLIQUE,
      PORTAGE_SALARIAL: classic.PORTAGE_SALARIAL,
      AUTO_ENTREPRENEUR: { employee: auto.services },
      PROFESSION_LIBERALE: { employee: auto.liberale },
    },
  };
}

async function main() {
  try {
    const rates = await fetchRates();
    const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const filePath = join(process.cwd(), "data", `rates_fr_${date}.json`);

    writeFileSync(filePath, JSON.stringify(rates, null, 2));
    console.log(`✅ Taux mis à jour dans ${filePath}`);
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour des taux:", error);
    process.exit(1);
  }
}

main();
