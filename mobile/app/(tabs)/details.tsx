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
import { ChargeBreakdown } from "../../components/ChargeBreakdown";
import { SocialPyramid } from "../../components/SocialPyramid";
import { getTheme } from "../../constants/theme";

const STATUS_LABELS: Record<string, string> = {
  NON_CADRE: "Non Cadre",
  CADRE: "Cadre",
  FONCTION_PUBLIQUE: "Fonction Publique",
  PROFESSION_LIBERALE: "Profession Libérale",
  AUTO_ENTREPRENEUR: "Auto-Entrepreneur",
  PORTAGE_SALARIAL: "Portage Salarial",
};

export default function DetailsScreen() {
  const { state } = useCalculatorContext();
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const styles = makeStyles(theme);

  const { values, status, monthlyNetAfterTax } = state;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Détails</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{STATUS_LABELS[status]}</Text>
          </View>
        </View>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Brut mensuel</Text>
            <Text style={styles.statValue}>
              {values.monthlyBrut.toLocaleString("fr-FR", {
                maximumFractionDigits: 0,
              })}{" "}
              €
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Net mensuel</Text>
            <Text style={[styles.statValue, { color: theme.primary }]}>
              {values.monthlyNet.toLocaleString("fr-FR", {
                maximumFractionDigits: 0,
              })}{" "}
              €
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Après impôt</Text>
            <Text style={[styles.statValue, { color: theme.primary }]}>
              {monthlyNetAfterTax.toLocaleString("fr-FR", {
                maximumFractionDigits: 0,
              })}{" "}
              €
            </Text>
          </View>
        </View>

        <ChargeBreakdown status={status} monthlyBrut={values.monthlyBrut} />

        <SocialPyramid monthlyNet={values.monthlyNet} />
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
      marginBottom: 16,
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
    statsRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.card,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 10,
      alignItems: "center",
    },
    statLabel: {
      fontSize: 10,
      color: theme.mutedForeground,
      marginBottom: 4,
      textAlign: "center",
    },
    statValue: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.foreground,
      textAlign: "center",
    },
  });
}
