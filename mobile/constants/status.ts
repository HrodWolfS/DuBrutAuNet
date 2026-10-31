import type { StatusType } from "../../shared/salary";

export const STATUS_LABELS: Record<StatusType, string> = {
  NON_CADRE: "Non Cadre",
  CADRE: "Cadre",
  FONCTION_PUBLIQUE: "Fonction Publique",
  PROFESSION_LIBERALE: "Profession Libérale",
  AUTO_ENTREPRENEUR: "Auto-Entrepreneur",
  PORTAGE_SALARIAL: "Portage Salarial",
};
