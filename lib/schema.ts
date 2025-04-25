import { z } from "zod";

export const calculatorSchema = z.object({
  amount: z.coerce
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
    ["CDI", "CDD", "FONCTION_PUBLIQUE", "ALTERNANCE", "AUTO_ENTREPRENEUR"],
    {
      required_error: "Veuillez sélectionner un statut",
    }
  ),
  hoursPerWeek: z.coerce
    .number()
    .min(1, "Le nombre d'heures doit être positif")
    .max(50, "Le nombre d'heures doit être inférieur à 50")
    .optional(),
});

export type CalculatorInput = z.infer<typeof calculatorSchema>;
