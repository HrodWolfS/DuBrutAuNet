import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import { getTheme } from "../constants/theme";
import { StatusType } from "../lib/hooks/useCalculator";

const CHARGES_PATRONALES_RATE = 0.45;
const URSSAF_AE_RATE = 0.212;

interface FreelanceComparatorProps {
  status: StatusType;
  mensuelBrut: number;
  mensuelNetCDI: number;
  taxRate: number;
}

export function FreelanceComparator({
  status,
  mensuelBrut,
  mensuelNetCDI,
  taxRate,
}: FreelanceComparatorProps) {
  const [expanded, setExpanded] = useState(false);
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const styles = makeStyles(theme);

  if (status === "AUTO_ENTREPRENEUR") {
    return null;
  }

  const superBrut = mensuelBrut * (1 + CHARGES_PATRONALES_RATE);
  const netAEAvantIR = superBrut * (1 - URSSAF_AE_RATE);
  const netAE = netAEAvantIR * (1 - taxRate / 100);
  const diff = netAE - mensuelNetCDI;
  const isPositive = diff >= 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Ionicons
            name="flash-outline"
            size={18}
            color={theme.primary}
            style={styles.headerIcon}
          />
          <Text style={styles.title}>Comparateur Freelance</Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={theme.mutedForeground}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Pour le même budget employeur de{" "}
              <Text style={styles.infoHighlight}>
                {superBrut.toLocaleString("fr-FR", {
                  maximumFractionDigits: 0,
                })}{" "}
                €
              </Text>
              , vous toucheriez{" "}
              <Text style={[styles.infoHighlight, { color: theme.primary }]}>
                {netAE.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
              </Text>{" "}
              net en Auto-entreprise (après {taxRate}% PAS)
            </Text>
          </View>

          <View style={styles.comparisonGrid}>
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>Coût employeur</Text>
              <Text style={styles.comparisonValue}>
                {superBrut.toLocaleString("fr-FR", {
                  maximumFractionDigits: 0,
                })}{" "}
                €
              </Text>
              <Text style={styles.comparisonSub}>Super brut</Text>
            </View>

            <View style={styles.comparisonDivider} />

            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>Net CDI</Text>
              <Text style={styles.comparisonValue}>
                {mensuelNetCDI.toLocaleString("fr-FR", {
                  maximumFractionDigits: 0,
                })}{" "}
                €
              </Text>
              <Text style={styles.comparisonSub}>Après PAS {taxRate}%</Text>
            </View>

            <View style={styles.comparisonDivider} />

            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>Net AE</Text>
              <Text style={[styles.comparisonValue, { color: theme.primary }]}>
                {netAE.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
              </Text>
              <Text style={styles.comparisonSub}>Après PAS {taxRate}%</Text>
            </View>
          </View>

          <View
            style={[
              styles.diffBadge,
              isPositive ? styles.diffPositive : styles.diffNegative,
            ]}
          >
            <Ionicons
              name={isPositive ? "trending-up" : "trending-down"}
              size={16}
              color={isPositive ? theme.primary : "#EF4444"}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.diffText,
                { color: isPositive ? theme.primary : "#EF4444" },
              ]}
            >
              {isPositive ? "+" : ""}
              {diff.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} € par
              rapport au CDI
            </Text>
          </View>

          <View style={styles.detailRows}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Cotisations patronales (45%)
              </Text>
              <Text style={styles.detailValue}>
                +
                {(superBrut - mensuelBrut).toLocaleString("fr-FR", {
                  maximumFractionDigits: 0,
                })}{" "}
                €
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                URSSAF Auto-entrepreneur (21.2%)
              </Text>
              <Text style={styles.detailValue}>
                -
                {(superBrut * URSSAF_AE_RATE).toLocaleString("fr-FR", {
                  maximumFractionDigits: 0,
                })}{" "}
                €
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Impôt sur le revenu (PAS {taxRate}%)
              </Text>
              <Text style={styles.detailValue}>
                -
                {(netAEAvantIR * (taxRate / 100)).toLocaleString("fr-FR", {
                  maximumFractionDigits: 0,
                })}{" "}
                €
              </Text>
            </View>
          </View>

          <Text style={styles.disclaimer}>
            * Simulation indicative. Ne tient pas compte des frais
            professionnels, de la protection sociale ou des avantages en nature.
          </Text>
        </View>
      )}
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof getTheme>) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
      marginBottom: 16,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    headerIcon: {
      marginRight: 8,
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.foreground,
    },
    content: {
      borderTopWidth: 1,
      borderTopColor: theme.border,
      padding: 16,
      gap: 16,
    },
    infoBox: {
      backgroundColor: theme.primary + "15",
      borderRadius: 8,
      padding: 12,
      borderLeftWidth: 3,
      borderLeftColor: theme.primary,
    },
    infoText: {
      fontSize: 13,
      color: theme.foreground,
      lineHeight: 20,
    },
    infoHighlight: {
      fontWeight: "700",
      color: theme.foreground,
    },
    comparisonGrid: {
      flexDirection: "row",
      backgroundColor: theme.muted,
      borderRadius: 8,
      padding: 12,
    },
    comparisonItem: {
      flex: 1,
      alignItems: "center",
    },
    comparisonDivider: {
      width: 1,
      backgroundColor: theme.border,
      marginHorizontal: 8,
    },
    comparisonLabel: {
      fontSize: 11,
      color: theme.mutedForeground,
      marginBottom: 4,
      textAlign: "center",
    },
    comparisonValue: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.foreground,
      marginBottom: 2,
    },
    comparisonSub: {
      fontSize: 10,
      color: theme.mutedForeground,
      textAlign: "center",
    },
    diffBadge: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    diffPositive: {
      backgroundColor: theme.primary + "15",
    },
    diffNegative: {
      backgroundColor: "#EF444415",
    },
    diffText: {
      fontSize: 14,
      fontWeight: "700",
    },
    detailRows: {
      gap: 8,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    detailLabel: {
      fontSize: 12,
      color: theme.mutedForeground,
      flex: 1,
      paddingRight: 8,
    },
    detailValue: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.foreground,
    },
    disclaimer: {
      fontSize: 11,
      color: theme.mutedForeground,
      fontStyle: "italic",
      lineHeight: 16,
    },
  });
}
