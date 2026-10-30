import React from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getTheme } from "../../constants/theme";
import { employeeRate, RATES, STATUSES } from "../../../shared/salary";
import {
  CONTACT_EMAIL,
  formatFrenchDate,
  HOST,
  METHOD_LIMITS,
  METHOD_STEPS,
  PRIVACY_URL,
  PUBLISHER,
  ratesValidityLabel,
  SOURCES,
  SUPPORT_URL,
} from "../../../shared/legal";

const formatPercent = (rate: number) =>
  `${(rate * 100).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} %`;

export default function AboutScreen() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const styles = makeStyles(theme);

  const LinkRow = ({ label, url }: { label: string; url: string }) => (
    <TouchableOpacity
      style={styles.linkRow}
      onPress={() => Linking.openURL(url)}
      activeOpacity={0.7}
      accessibilityRole="link"
    >
      <Text style={styles.linkText}>{label}</Text>
      <Ionicons name="open-outline" size={14} color={theme.primary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.pageTitle}>Méthode & sources</Text>
        <Text style={styles.subtitle}>
          {ratesValidityLabel()} · mis à jour le{" "}
          {formatFrenchDate(RATES.lastUpdate)}
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Comment est calculé le net ?</Text>
          {METHOD_STEPS.map((step) => (
            <Text key={step} style={styles.bullet}>
              • {step}
            </Text>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Taux appliqués</Text>
          {STATUSES.map((status) => (
            <View key={status} style={styles.rateRow}>
              <Text style={styles.rateLabel}>
                {RATES.statuses[status].title}
              </Text>
              <Text style={styles.rateValue}>
                {formatPercent(employeeRate(status))}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Limites</Text>
          <Text style={styles.body}>{METHOD_LIMITS}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sources officielles</Text>
          {SOURCES.map((source) => (
            <LinkRow key={source.url} label={source.label} url={source.url} />
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mentions légales</Text>
          <Text style={styles.body}>
            Éditeur : {PUBLISHER.name} — {PUBLISHER.status}.
          </Text>
          <Text style={styles.body}>
            Hébergement du site : {HOST.name}, {HOST.address}.
          </Text>
          <LinkRow label={CONTACT_EMAIL} url={`mailto:${CONTACT_EMAIL}`} />
          <LinkRow label="Politique de confidentialité" url={PRIVACY_URL} />
          <LinkRow label="Aide et support" url={SUPPORT_URL} />
        </View>
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
    pageTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.foreground,
    },
    subtitle: {
      fontSize: 12,
      color: theme.mutedForeground,
      marginTop: 4,
      marginBottom: 16,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      marginBottom: 16,
      gap: 8,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.foreground,
    },
    body: {
      fontSize: 13,
      lineHeight: 19,
      color: theme.mutedForeground,
    },
    bullet: {
      fontSize: 13,
      lineHeight: 19,
      color: theme.foreground,
    },
    rateRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    rateLabel: {
      flex: 1,
      fontSize: 13,
      color: theme.foreground,
    },
    rateValue: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.primary,
    },
    linkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 4,
    },
    linkText: {
      fontSize: 13,
      color: theme.primary,
      textDecorationLine: "underline",
    },
  });
}
