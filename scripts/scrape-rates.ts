import { writeFileSync } from "fs";
import { join } from "path";

interface RateTable {
  lastUpdate: string;
  smic: {
    hourly: number;
    monthly: number;
  };
  urssaf: {
    cdi: {
      employee: number;
      employer: number;
    };
    cdd: {
      employee: number;
      employer: number;
    };
  };
  autoEntrepreneur: {
    services: number;
  };
}

async function fetchRates(): Promise<RateTable> {
  // TODO: Implémenter le vrai scraping
  // Pour l'instant, on retourne des données de test
  return {
    lastUpdate: new Date().toISOString(),
    smic: {
      hourly: 11.65,
      monthly: 1766.92,
    },
    urssaf: {
      cdi: {
        employee: 0.22,
        employer: 0.42,
      },
      cdd: {
        employee: 0.22,
        employer: 0.45,
      },
    },
    autoEntrepreneur: {
      services: 0.212,
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
