import React from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
} from "react-native";
import { useCalculatorContext } from "../../context/CalculatorContext";
import { FreelanceComparator } from "../../components/FreelanceComparator";
import { getTheme } from "../../constants/theme";

const STATUS_LABELS: Record<string, string> = {
  NON_CADRE: "Non Cadre",
  CADRE: "Cadre",
  FONCTION_PUBLIQUE: "Fonction Publique",
  PROFESSION_LIBERALE: "Profession Libérale",
  AUTO_ENTREPRENEUR: "Auto-Entrepreneur",
  PORTAGE_SALARIAL: "Portage Salarial",
};

export default function ComparatorScreen() {
  const { state } = useCalculatorContext();
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const styles = makeStyles(theme);

  const { values, status, taxRate, monthlyNetAfterTax } = state;

  const isAE = status === "AUTO_ENTREPRENEUR";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Comparateur</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{STATUS_LABELS[status]}</Text>
          </View>
        </View>

        <Text style={styles.description}>
          Comparez votre rémunération en CDI avec une activité en
          Auto-entreprise pour le même coût employeur.
        </Text>

        {isAE ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>
              Statut Auto-Entrepreneur sélectionné
            </Text>
            <Text style={styles.infoText}>
              Le comparateur n&apos;est pas disponible pour le statut
              Auto-Entrepreneur car la simulation suppose déjà ce régime.
              Sélectionnez un autre statut dans l&apos;onglet Calculateur pour
              accéder à la comparaison.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.contextCard}>
              <View style={styles.contextRow}>
                <Text style={styles.contextLabel}>Brut mensuel actuel</Text>
                <Text style={styles.contextValue}>
                  {values.monthlyBrut.toLocaleString("fr-FR", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  €
                </Text>
              </View>
              <View style={styles.contextDivider} />
              <View style={styles.contextRow}>
                <Text style={styles.contextLabel}>Net mensuel après impôt</Text>
                <Text style={[styles.contextValue, { color: theme.primary }]}>
                  {monthlyNetAfterTax.toLocaleString("fr-FR", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  €
                </Text>
              </View>
              <View style={styles.contextDivider} />
              <View style={styles.contextRow}>
                <Text style={styles.contextLabel}>Taux PAS appliqué</Text>
                <Text style={styles.contextValue}>{taxRate}%</Text>
              </View>
            </View>

            <FreelanceComparator
              status={status}
              mensuelBrut={values.monthlyBrut}
              mensuelNetCDI={monthlyNetAfterTax}
              taxRate={taxRate}
            />

            <View style={styles.helpCard}>
              <Text style={styles.helpTitle}>
                Comment fonctionne le calcul ?
              </Text>
              {["1", "2", "3"].map((n, i) => (
                <View key={n} style={styles.helpStep}>
                  <View style={styles.helpStepBadge}>
                    <Text style={styles.helpStepNumber}>{n}</Text>
                  </View>
                  <Text style={styles.helpStepText}>
                    {i === 0
                      ? "Le coût employeur (super brut) est calculé en ajoutant 45% de charges patronales au brut."
                      : i === 1
                        ? "En Auto-entreprise, ce même budget vous génère un CA, duquel on déduit 21,2% d'URSSAF."
                        : "On applique ensuite votre taux de Prélèvement À la Source pour obtenir le net comparable."}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(theme: ReturnType<typeof getTheme>) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32,
    },
    pageHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    pageTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.foreground,
    },
    statusBadge: {
      backgroundColor: theme.primary + "15",
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: theme.primary + "40",
    },
    statusBadgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.primary,
    },
    description: {
      fontSize: 13,
      color: theme.mutedForeground,
      lineHeight: 20,
      marginBottom: 16,
    },
    infoCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
    },
    infoTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.foreground,
      marginBottom: 8,
    },
    infoText: {
      fontSize: 13,
      color: theme.mutedForeground,
      lineHeight: 20,
    },
    contextCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      marginBottom: 16,
    },
    contextRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 6,
    },
    contextDivider: {
      height: 1,
      backgroundColor: theme.border,
    },
    contextLabel: {
      fontSize: 13,
      color: theme.mutedForeground,
    },
    contextValue: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.foreground,
    },
    helpCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
    },
    helpTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.foreground,
      marginBottom: 12,
    },
    helpStep: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 10,
      gap: 10,
    },
    helpStepBadge: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.primary,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    helpStepNumber: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "700",
      lineHeight: 16,
    },
    helpStepText: {
      flex: 1,
      fontSize: 12,
      color: theme.mutedForeground,
      lineHeight: 18,
    },
  });
}
