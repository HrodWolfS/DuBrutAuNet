import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import { getTheme } from "../constants/theme";
import { StatusType } from "../lib/hooks/useCalculator";

interface ChargeItem {
  label: string;
  rate: number;
}

const CHARGE_ITEMS: Record<StatusType, ChargeItem[]> = {
  NON_CADRE: [
    { label: "Assurance vieillesse plafonnée", rate: 0.069 },
    { label: "Assurance vieillesse déplafonnée", rate: 0.004 },
    { label: "Retraite complémentaire T1", rate: 0.0315 },
    { label: "CEG T1", rate: 0.0086 },
    { label: "CET", rate: 0.0014 },
    { label: "CSG déductible", rate: 0.068 },
    { label: "CSG non déductible", rate: 0.024 },
    { label: "CRDS", rate: 0.005 },
  ],
  CADRE: [
    { label: "Assurance vieillesse plafonnée", rate: 0.069 },
    { label: "Assurance vieillesse déplafonnée", rate: 0.004 },
    { label: "Retraite complémentaire T1", rate: 0.0315 },
    { label: "CEG T1", rate: 0.0086 },
    { label: "CET", rate: 0.0014 },
    { label: "CSG déductible", rate: 0.068 },
    { label: "CSG non déductible", rate: 0.024 },
    { label: "CRDS", rate: 0.005 },
    { label: "Retraite T2", rate: 0.0864 },
    { label: "CEG T2", rate: 0.0108 },
    { label: "APEC", rate: 0.00024 },
  ],
  FONCTION_PUBLIQUE: [
    { label: "Pension civile", rate: 0.111 },
    { label: "RAFP", rate: 0.05 },
    { label: "CSG déductible", rate: 0.068 },
    { label: "CSG non déductible", rate: 0.024 },
    { label: "CRDS", rate: 0.005 },
  ],
  AUTO_ENTREPRENEUR: [{ label: "Forfait social", rate: 0.212 }],
  PORTAGE_SALARIAL: [
    { label: "Assurance vieillesse plafonnée", rate: 0.069 },
    { label: "Assurance vieillesse déplafonnée", rate: 0.004 },
    { label: "Retraite complémentaire T1", rate: 0.0315 },
    { label: "CEG T1", rate: 0.0086 },
    { label: "CET", rate: 0.0014 },
    { label: "CSG déductible", rate: 0.068 },
    { label: "CSG non déductible", rate: 0.024 },
    { label: "CRDS", rate: 0.005 },
  ],
  PROFESSION_LIBERALE: [
    { label: "Maladie-maternité", rate: 0.065 },
    { label: "IJ", rate: 0.005 },
    { label: "Allocations familiales", rate: 0.031 },
    { label: "Retraite de base", rate: 0.0873 },
    { label: "Retraite complémentaire T1", rate: 0.09 },
    { label: "Retraite complémentaire T2", rate: 0.22 },
    { label: "Invalidité-décès", rate: 0.013 },
    { label: "CSG déductible", rate: 0.068 },
    { label: "CSG non déductible", rate: 0.024 },
    { label: "CRDS", rate: 0.005 },
    { label: "CFP", rate: 0.0025 },
  ],
};

const GLOBAL_RATE: Record<StatusType, number> = {
  NON_CADRE: 0.22,
  CADRE: 0.245,
  PORTAGE_SALARIAL: 0.22,
  FONCTION_PUBLIQUE: 0.167,
  PROFESSION_LIBERALE: 0.3567,
  AUTO_ENTREPRENEUR: 0.212,
};

const AVERAGE_NET: Record<StatusType, number> = {
  NON_CADRE: 1950,
  CADRE: 3375,
  FONCTION_PUBLIQUE: 2527,
  PORTAGE_SALARIAL: 4000,
  AUTO_ENTREPRENEUR: 1650,
  PROFESSION_LIBERALE: 3000,
};

interface ChargeBreakdownProps {
  status: StatusType;
  monthlyBrut: number;
}

export function ChargeBreakdown({ status, monthlyBrut }: ChargeBreakdownProps) {
  const [expanded, setExpanded] = useState(false);
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const styles = makeStyles(theme);

  const items = CHARGE_ITEMS[status];
  const globalRate = GLOBAL_RATE[status];
  const totalCharges = monthlyBrut * globalRate;
  const monthlyNet = monthlyBrut * (1 - globalRate);
  const avgNet = AVERAGE_NET[status];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Détail des cotisations</Text>
          <Text style={styles.subtitle}>
            {(globalRate * 100).toFixed(1)}% ·{" "}
            {totalCharges.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}{" "}
            €
          </Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={theme.mutedForeground}
        />
      </TouchableOpacity>

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Brut mensuel</Text>
          <Text style={styles.summaryValue}>
            {monthlyBrut.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}{" "}
            €
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Net mensuel</Text>
          <Text style={[styles.summaryValue, { color: theme.primary }]}>
            {monthlyNet.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Net moyen</Text>
          <Text style={styles.summaryValue}>
            {avgNet.toLocaleString("fr-FR")} €
          </Text>
        </View>
      </View>

      {expanded && (
        <View style={styles.itemsContainer}>
          <View style={styles.itemsHeader}>
            <Text style={styles.itemsHeaderText}>Cotisation</Text>
            <Text style={styles.itemsHeaderText}>Taux</Text>
            <Text style={styles.itemsHeaderText}>Montant</Text>
          </View>
          {items.map((item, index) => (
            <View
              key={index}
              style={[styles.item, index % 2 === 0 && styles.itemEven]}
            >
              <Text style={styles.itemLabel} numberOfLines={2}>
                {item.label}
              </Text>
              <Text style={styles.itemRate}>
                {(item.rate * 100).toFixed(2)}%
              </Text>
              <Text style={styles.itemAmount}>
                {(monthlyBrut * item.rate).toLocaleString("fr-FR", {
                  maximumFractionDigits: 0,
                })}{" "}
                €
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total cotisations</Text>
            <Text style={styles.totalRate}>
              {(globalRate * 100).toFixed(1)}%
            </Text>
            <Text style={styles.totalAmount}>
              {totalCharges.toLocaleString("fr-FR", {
                maximumFractionDigits: 0,
              })}{" "}
              €
            </Text>
          </View>
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
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.foreground,
      marginBottom: 2,
    },
    subtitle: {
      fontSize: 13,
      color: theme.mutedForeground,
    },
    summaryRow: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    summaryItem: {
      flex: 1,
      alignItems: "center",
    },
    summaryDivider: {
      width: 1,
      backgroundColor: theme.border,
    },
    summaryLabel: {
      fontSize: 11,
      color: theme.mutedForeground,
      marginBottom: 4,
      textAlign: "center",
    },
    summaryValue: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.foreground,
    },
    itemsContainer: {
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    itemsHeader: {
      flexDirection: "row",
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: theme.muted,
    },
    itemsHeaderText: {
      flex: 1,
      fontSize: 11,
      fontWeight: "600",
      color: theme.mutedForeground,
      textTransform: "uppercase",
    },
    item: {
      flexDirection: "row",
      paddingHorizontal: 12,
      paddingVertical: 10,
      alignItems: "center",
    },
    itemEven: {
      backgroundColor: theme.muted + "40",
    },
    itemLabel: {
      flex: 2,
      fontSize: 12,
      color: theme.foreground,
      paddingRight: 8,
    },
    itemRate: {
      flex: 1,
      fontSize: 12,
      color: theme.mutedForeground,
      textAlign: "right",
    },
    itemAmount: {
      flex: 1,
      fontSize: 12,
      fontWeight: "600",
      color: theme.foreground,
      textAlign: "right",
    },
    totalRow: {
      flexDirection: "row",
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.muted,
      alignItems: "center",
    },
    totalLabel: {
      flex: 2,
      fontSize: 13,
      fontWeight: "700",
      color: theme.foreground,
    },
    totalRate: {
      flex: 1,
      fontSize: 13,
      fontWeight: "700",
      color: theme.foreground,
      textAlign: "right",
    },
    totalAmount: {
      flex: 1,
      fontSize: 13,
      fontWeight: "700",
      color: theme.primary,
      textAlign: "right",
    },
  });
}
