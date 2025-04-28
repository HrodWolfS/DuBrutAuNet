import { z } from "zod";

export const formSchema = z.object({
  amount: z
    .number()
    .min(0, "Le montant doit être positif")
    .max(1000000, "Le montant doit être inférieur à 1 000 000"),
  unit: z.enum(["hourly", "daily", "monthly", "yearly"], {
    required_error: "Veuillez sélectionner une période",
  }),
  direction: z.enum(["brut", "net"], {
    required_error: "Veuillez sélectionner brut ou net",
  }),
  status: z.enum(
    [
      "NON_CADRE",
      "CADRE",
      "FONCTION_PUBLIQUE",
      "AUTO_ENTREPRENEUR",
      "PORTAGE_SALARIAL",
      "PROFESSION_LIBERALE",
    ],
    {
      required_error: "Veuillez sélectionner un statut",
    }
  ),
  hoursPerWeek: z
    .number()
    .min(0, "Le nombre d'heures doit être positif")
    .max(50, "Le nombre d'heures doit être inférieur à 50")
    .optional(),
});

export type CalculatorInput = z.infer<typeof formSchema>;
