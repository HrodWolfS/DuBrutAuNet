import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

async function fetchSmic() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
  );
  await page.setExtraHTTPHeaders({
    "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
  });
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto(
    "https://www.urssaf.fr/accueil/outils-documentation/taux-baremes/montant-smic.html",
    { waitUntil: "networkidle2" }
  );

  const smic = await page.evaluate(() => {
    const table = document.querySelector("#Cas-general-2025 table");
    if (!table) return null;

    const rows = Array.from(table.querySelectorAll("tbody tr"));
    let hourly = null;
    let monthly = null;

    for (const row of rows) {
      const th = row.querySelector("th");
      const td = row.querySelector("td");
      if (!th || !td) continue;

      const label = th.innerText.toLowerCase();
      const valueText = td.innerText
        .replace(/\s/g, "")
        .replace(",", ".")
        .replace(/[^\d.]/g, "");

      const value = parseFloat(valueText);

      if (label.includes("horaire brut")) {
        hourly = value;
      }
      if (label.includes("mensuel")) {
        monthly = value;
      }
    }

    if (hourly === null || monthly === null) {
      return null;
    }

    return { hourly, monthly };
  });

  await browser.close();

  if (!smic) {
    console.error("❌ Impossible de récupérer le SMIC");
    process.exit(1);
  }

  const filePath = path.join(__dirname, "../data/rates_fr_2025.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  data.smic = smic;
  data.lastUpdate = new Date().toISOString();

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log("✅ SMIC mis à jour avec succès !");
}

fetchSmic().catch((error) => {
  console.error("❌ Erreur pendant la récupération du SMIC :", error);
});
