"use client";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Fonction d'extraction de données directement depuis le DOM
const extractDataFromDOM = () => {
  // Trouver l'élément résultat
  const resultCard = document.getElementById("result-card");
  if (!resultCard) return null;

  try {
    // Extraire le statut (Non-cadre, Cadre, etc.)
    let status = "Non-cadre"; // Valeur par défaut
    const statusEl = resultCard.querySelector(".bg-gradient-to-r, h1, h2, h3");
    if (statusEl && statusEl.textContent) {
      const statusMatch = statusEl.textContent.match(/\(([^)]+)\)/);
      if (statusMatch && statusMatch[1]) {
        status = statusMatch[1];
      }
    }

    // Extraire les valeurs des montants
    const rows = resultCard.querySelectorAll(".flex.justify-between");

    // Initialiser les données avec des valeurs par défaut
    const data = {
      status: status,
      cotisations: { percent: "0%", amount: "0 €" },
      impot: { percent: "0%", amount: "0 €" },
      netApresImpot: "0 €",
      netComparaison: "0",
      annuelNet: "0 €",
      formule: "",
    };

    // Parcourir les lignes pour extraire les valeurs précises
    rows.forEach((row) => {
      const label = row
        .querySelector("span:first-child")
        ?.textContent?.trim()
        .toLowerCase();

      if (label && label.includes("cotisations sociales")) {
        // Extraire pourcentage et montant des cotisations
        const percentEl = row.querySelector(
          ".text-muted-foreground"
        )?.textContent;
        const amountEl = row.querySelector("span:last-child")?.textContent;

        if (percentEl) data.cotisations.percent = percentEl.trim();
        if (amountEl) data.cotisations.amount = amountEl.trim();
      } else if (label && label.includes("impôt sur le revenu")) {
        // Extraire pourcentage et montant de l'impôt
        const percentEl = row.querySelector(
          ".text-muted-foreground"
        )?.textContent;
        const amountEl = row.querySelector("span:last-child")?.textContent;

        if (percentEl) data.impot.percent = percentEl.trim();
        if (amountEl) data.impot.amount = amountEl.trim();
      } else if (label && label.includes("net après impôt")) {
        // Extraire montant net après impôt
        const amountEl = row.querySelector("span:last-child")?.textContent;
        if (amountEl) data.netApresImpot = amountEl.trim();
      } else if (label && label.includes("annuel net")) {
        // Extraire montant annuel net
        const amountEl = row.querySelector("span:last-child")?.textContent;
        if (amountEl) data.annuelNet = amountEl.trim();
      }
    });

    // Extraire le pourcentage de comparaison
    if (resultCard.textContent) {
      const comparisonText = resultCard.textContent.match(
        /représente\s+(\d+)\s*%/
      );
      if (comparisonText && comparisonText[1]) {
        data.netComparaison = comparisonText[1];
      }
    }

    // Extraire directement depuis la barre de progression
    const progressBar = resultCard.querySelector(".bg-gradient-to-r");
    if (
      progressBar &&
      (progressBar as HTMLElement).style &&
      (progressBar as HTMLElement).style.width
    ) {
      const width = (progressBar as HTMLElement).style.width;
      const percentMatch = width.match(/(\d+)%/);
      if (percentMatch && percentMatch[1]) {
        data.netComparaison = percentMatch[1];
      }
    }

    // Extraire la formule de calcul
    const formulaEl = resultCard.querySelector(
      ".text-center.text-xs, .text-xs.text-muted-foreground"
    );
    if (formulaEl && formulaEl.textContent) {
      data.formule = formulaEl.textContent.trim();
    }

    return data;
  } catch (error) {
    console.error("Erreur lors de l'extraction des données:", error);
    return null;
  }
};

// Fonction d'export PDF
export const exportToPdf = async () => {
  try {
    // 1. Extraire les données directement du DOM
    const data = extractDataFromDOM();
    if (!data) {
      console.error("Impossible d'extraire les données pour l'export");
      alert("Impossible de générer le PDF. Veuillez réessayer.");
      return false;
    }

    // 2. Créer un conteneur pour l'export
    const exportContainer = document.createElement("div");
    exportContainer.style.position = "fixed";
    exportContainer.style.zIndex = "-9999";
    exportContainer.style.left = "-9999px";
    exportContainer.style.top = "0";
    exportContainer.style.width = "1000px";
    exportContainer.style.padding = "50px";
    exportContainer.style.backgroundColor = "#ffffff";
    exportContainer.style.color = "#000000";
    exportContainer.style.fontFamily = "Arial, sans-serif";
    document.body.appendChild(exportContainer);

    // 3. Créer le contenu HTML avec les données extraites
    exportContainer.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #000; font-size: 32px; margin-bottom: 5px;">Résultat Salaire</h1>
        <h2 style="color: #555; font-size: 24px; font-weight: normal; margin-top: 5px;">Charges salariales (${
          data.status
        })</h2>
      </div>
      
      <div style="background-color: #f8f9fa; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 14px 0; font-weight: bold; font-size: 16px; width: 60%;">Total cotisations sociales</td>
            <td style="padding: 14px 0; color: #555; font-size: 16px; width: 15%; text-align: right;">${
              data.cotisations.percent
            }</td>
            <td style="padding: 14px 0; font-weight: bold; font-size: 16px; width: 25%; text-align: right;">${
              data.cotisations.amount
            }</td>
          </tr>
          
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 14px 0; font-weight: bold; font-size: 16px;">Impôt sur le revenu</td>
            <td style="padding: 14px 0; color: #555; font-size: 16px; text-align: right;">${
              data.impot.percent
            }</td>
            <td style="padding: 14px 0; font-weight: bold; font-size: 16px; text-align: right;">${
              data.impot.amount
            }</td>
          </tr>
          
          <tr>
            <td style="padding: 14px 0; font-weight: bold; font-size: 16px;">Net après impôt</td>
            <td style="padding: 14px 0;"></td>
            <td style="padding: 14px 0; font-weight: bold; font-size: 20px; text-align: right;">${
              data.netApresImpot
            }</td>
          </tr>
        </table>
        
        <div style="margin: 20px 0;">
          <!-- Barre de progression avec dégradé vert -->
          <div style="background-color: #eee; height: 24px; border-radius: 12px; position: relative; overflow: hidden; margin-top: 20px;">
            <div style="background: linear-gradient(to right, #4ade80, #34d399); width: ${
              data.netComparaison
            }%; height: 100%; border-radius: 12px;"></div>
          </div>
          
          <div style="text-align: center; margin: 15px 0; font-style: italic; color: #555; font-size: 16px;">
            Votre net représente ${data.netComparaison}% du net moyen non-cadre.
          </div>
        </div>
        
        <hr style="border: 0; height: 1px; background-color: #ddd; margin: 30px 0;" />
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 14px 0; font-weight: bold; font-size: 18px; width: 60%;">Annuel net (avec prime)</td>
            <td style="padding: 14px 0; width: 40%; text-align: right;">
              <span style="font-weight: bold; font-size: 20px;">${
                data.annuelNet
              }</span>
            </td>
          </tr>
        </table>
        
        <div style="color: #666; font-size: 14px; text-align: center; font-style: italic; margin-top: 15px; clear: both;">
          ${data.formule}
        </div>
      </div>
      
      <div style="margin-top: 30px; font-size: 14px; color: #777; text-align: center;">
        Calculé le ${new Date().toLocaleDateString(
          "fr-FR"
        )} - Ces résultats sont des estimations indicatives.
      </div>
    `;

    // 4. Générer l'image
    const canvas = await html2canvas(exportContainer, {
      scale: 2,
      backgroundColor: "#FFFFFF",
      logging: false,
      windowWidth: 1000,
      width: 1000,
    });

    // 5. Nettoyer l'élément temporaire
    document.body.removeChild(exportContainer);

    // 6. Créer le PDF
    const imgData = canvas.toDataURL("image/png");
    const pdfWidth = canvas.width;
    const pdfHeight = canvas.height;
    const margin = 50;

    const pdf = new jsPDF({
      orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
      unit: "px",
      format: [pdfWidth + margin * 2, pdfHeight + margin * 2],
    });

    pdf.addImage(imgData, "PNG", margin, margin, pdfWidth, pdfHeight);
    pdf.save("resultat-salaire.pdf");

    return true;
  } catch (error) {
    console.error("Erreur lors de l'export PDF:", error);
    alert("Une erreur s'est produite lors de l'export. Veuillez réessayer.");
    return false;
  }
};

// Composant simple sans hooks et sans props pour l'intégration
const PdfExporter = ({
  buttonText = "Exporter en PDF",
  buttonClassName = "text-sm bg-[var(--primary)] text-white px-4 py-2 rounded-xl hover:opacity-90 transition",
}) => {
  return (
    <button onClick={exportToPdf} className={buttonClassName}>
      {buttonText}
    </button>
  );
};

export default PdfExporter;
