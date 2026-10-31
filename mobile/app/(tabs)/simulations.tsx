import React from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getTheme } from "../../constants/theme";
import { STATUS_LABELS } from "../../constants/status";
import { useCalculatorContext } from "../../context/CalculatorContext";
import { useSimulations } from "../../context/SimulationsContext";
import {
  MAX_PINNED,
  OFFER_LETTERS,
  simulate,
  type SavedSimulation,
} from "../../lib/simulations";
import { SwipeToDelete } from "../../components/SwipeToDelete";
import { haptics } from "../../lib/haptics";
import { ESTIMATE_NOTICE } from "../../../shared/legal";

const formatEuros = (n: number) =>
  `${(isFinite(n) ? n : 0).toLocaleString("fr-FR", {
    maximumFractionDigits: 0,
  })} €`;

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function SimulationsScreen() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const styles = makeStyles(theme);
  const router = useRouter();
  const { handlers } = useCalculatorContext();
  const { simulations, offers, remove, togglePin } = useSimulations();

  const offerResults = offers.map((sim) => simulate(sim.prefs));
  const bestNet = Math.max(...offerResults.map((r) => r.monthlyNetAfterTax));

  const recall = (sim: SavedSimulation) => {
    haptics.light();
    handlers.restore(sim.prefs);
    router.navigate("/");
  };

  const onTogglePin = (sim: SavedSimulation) => {
    if (togglePin(sim.id)) {
      haptics.selection();
      return;
    }
    haptics.warning();
    Alert.alert(
      "Comparaison complète",
      `Vous comparez déjà ${MAX_PINNED} offres. Retirez-en une pour en ajouter une autre.`,
    );
  };

  const onDelete = (sim: SavedSimulation) => {
    haptics.warning();
    remove(sim.id);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.pageTitle}>Simulations</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Comparer mes offres</Text>
          {offers.length === 0 ? (
            <Text style={styles.hint}>
              Épinglez jusqu&apos;à {MAX_PINNED} simulations de
              l&apos;historique pour comparer leur net après impôt côte à côte.
            </Text>
          ) : (
            <>
              <View style={styles.offerGrid}>
                {offers.map((sim, i) => {
                  const result = offerResults[i];
                  const gap = result.monthlyNetAfterTax - bestNet;
                  const isBest = offers.length > 1 && gap === 0;
                  return (
                    <TouchableOpacity
                      key={sim.id}
                      style={[styles.offer, isBest && styles.offerBest]}
                      onPress={() => recall(sim)}
                      activeOpacity={0.7}
                      accessibilityHint="Ouvre cette offre dans le calculateur"
                    >
                      <View style={styles.offerHeader}>
                        <Text style={styles.offerLetter}>
                          Offre {OFFER_LETTERS[i]}
                        </Text>
                        <TouchableOpacity
                          onPress={() => onTogglePin(sim)}
                          hitSlop={10}
                          accessibilityLabel={`Retirer l'offre ${OFFER_LETTERS[i]} de la comparaison`}
                        >
                          <Ionicons
                            name="close"
                            size={16}
                            color={theme.mutedForeground}
                          />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.offerStatus} numberOfLines={2}>
                        {STATUS_LABELS[sim.prefs.status]}
                      </Text>

                      <Text style={styles.offerLabel}>Net / mois</Text>
                      <Text style={styles.offerNet}>
                        {formatEuros(result.monthlyNetAfterTax)}
                      </Text>
                      <Text
                        style={[styles.offerGap, isBest && styles.offerGapBest]}
                      >
                        {offers.length === 1
                          ? " "
                          : isBest
                            ? "Meilleur net"
                            : `${formatEuros(gap)}/mois`}
                      </Text>

                      <Text style={styles.offerLabel}>Net / an</Text>
                      <Text style={styles.offerValue}>
                        {formatEuros(
                          sim.prefs.prime > 0
                            ? result.annualNetWithPrime
                            : result.yearlyNetAfterTax,
                        )}
                      </Text>
                      <Text style={styles.offerLabel}>Brut / mois</Text>
                      <Text style={styles.offerValue}>
                        {formatEuros(result.brut.monthly)}
                      </Text>
                      <Text style={styles.offerLabel}>Temps · PAS</Text>
                      <Text style={styles.offerValue}>
                        {sim.prefs.workPercent} % · {sim.prefs.taxRate} %
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {offers.length === 1 && (
                <Text style={styles.hint}>
                  Épinglez une autre simulation pour la comparer.
                </Text>
              )}
              <Text style={styles.notice}>
                Net annuel prime incluse. {ESTIMATE_NOTICE}
              </Text>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Historique</Text>
          {simulations.length === 0 ? (
            <Text style={styles.hint}>
              Aucune simulation enregistrée. Touchez « Enregistrer » sous le
              résultat du calculateur pour la retrouver ici.
            </Text>
          ) : (
            <>
              <Text style={styles.hint}>
                Touchez une simulation pour la rouvrir, glissez vers la gauche
                pour la supprimer.
              </Text>
              {simulations.map((sim) => {
                const result = simulate(sim.prefs);
                const pinned = sim.pinnedAt !== null;
                return (
                  <SwipeToDelete key={sim.id} onDelete={() => onDelete(sim)}>
                    <TouchableOpacity
                      style={styles.historyRow}
                      onPress={() => recall(sim)}
                      activeOpacity={0.7}
                      accessibilityHint="Ouvre cette simulation dans le calculateur"
                    >
                      <View style={styles.historyText}>
                        <Text style={styles.historyTitle}>
                          {STATUS_LABELS[sim.prefs.status]} ·{" "}
                          {formatEuros(result.brut.monthly)} brut
                        </Text>
                        <Text style={styles.historyMeta}>
                          {formatDate(sim.savedAt)}
                        </Text>
                      </View>
                      <Text style={styles.historyNet}>
                        {formatEuros(result.monthlyNetAfterTax)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => onTogglePin(sim)}
                        hitSlop={10}
                        accessibilityLabel={
                          pinned
                            ? "Retirer de la comparaison"
                            : "Ajouter à la comparaison"
                        }
                      >
                        <Ionicons
                          name={pinned ? "pin" : "pin-outline"}
                          size={20}
                          color={pinned ? theme.primary : theme.mutedForeground}
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </SwipeToDelete>
                );
              })}
            </>
          )}
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
      marginBottom: 16,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      marginBottom: 16,
      gap: 10,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.foreground,
    },
    hint: {
      fontSize: 13,
      lineHeight: 19,
      color: theme.mutedForeground,
    },
    notice: {
      fontSize: 11,
      color: theme.mutedForeground,
    },
    offerGrid: {
      flexDirection: "row",
      gap: 8,
    },
    offer: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      padding: 10,
      backgroundColor: theme.background,
    },
    offerBest: {
      borderColor: theme.primary,
      backgroundColor: theme.primary + "10",
    },
    offerHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    offerLetter: {
      fontSize: 13,
      fontWeight: "800",
      color: theme.foreground,
    },
    offerStatus: {
      fontSize: 11,
      color: theme.mutedForeground,
      minHeight: 28,
      marginTop: 2,
    },
    offerLabel: {
      fontSize: 10,
      color: theme.mutedForeground,
      marginTop: 8,
    },
    offerNet: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.primary,
    },
    offerGap: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.mutedForeground,
    },
    offerGapBest: {
      color: theme.primary,
    },
    offerValue: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.foreground,
    },
    historyRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: theme.muted,
    },
    historyText: {
      flex: 1,
    },
    historyTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.foreground,
    },
    historyMeta: {
      fontSize: 11,
      color: theme.mutedForeground,
      marginTop: 2,
    },
    historyNet: {
      fontSize: 15,
      fontWeight: "800",
      color: theme.primary,
    },
  });
}
