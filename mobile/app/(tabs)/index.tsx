import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { useCalculatorContext } from "../../context/CalculatorContext";
import {
  StatusType,
  DirectionType,
  PeriodType,
} from "../../lib/hooks/useCalculator";
import { getTheme } from "../../constants/theme";

const STATUS_OPTIONS: { key: StatusType; label: string }[] = [
  { key: "NON_CADRE", label: "Non Cadre" },
  { key: "CADRE", label: "Cadre" },
  { key: "FONCTION_PUBLIQUE", label: "Fonc. Publique" },
  { key: "PROFESSION_LIBERALE", label: "Prof. Libérale" },
  { key: "AUTO_ENTREPRENEUR", label: "Auto-Entrepreneur" },
  { key: "PORTAGE_SALARIAL", label: "Portage Salarial" },
];

function formatVal(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "0";
  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatCurrency(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "0";
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 0 });
}

export default function CalculatorScreen() {
  const { state, handlers } = useCalculatorContext();
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const styles = makeStyles(theme);

  const {
    values,
    status,
    taxRate,
    workPercent,
    hoursPerWeek,
    prime,
    monthlyNetAfterTax,
    yearlyNetAfterTax,
  } = state;
  const {
    handleValueChange,
    handleReset,
    setStatus,
    setTaxRate,
    setWorkPercent,
    setPrime,
  } = handlers;

  const getInputValue = (
    direction: DirectionType,
    period: PeriodType,
  ): string => {
    const isCurrent =
      state.input.direction === direction &&
      state.input.period === period &&
      typeof state.input.value === "string";
    if (isCurrent) return state.input.value as string;

    let num: number;
    if (direction === "brut") {
      switch (period) {
        case "hourly":
          num = values.hourlyBrut;
          break;
        case "monthly":
          num = values.monthlyBrut;
          break;
        case "yearly":
          num = values.yearlyBrut;
          break;
        default:
          num = 0;
      }
    } else {
      switch (period) {
        case "hourly":
          num = values.hourlyNet;
          break;
        case "monthly":
          num = values.monthlyNet;
          break;
        case "yearly":
          num = values.yearlyNet;
          break;
        default:
          num = 0;
      }
    }
    return formatVal(num);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Du Brut au Net</Text>
            <TouchableOpacity
              onPress={handleReset}
              style={styles.resetButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name="refresh"
                size={16}
                color={theme.mutedForeground}
              />
              <Text style={styles.resetText}>Réinitialiser</Text>
            </TouchableOpacity>
          </View>

          {/* Revenus card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Revenus</Text>
            <View style={styles.inputGrid}>
              {/* Brut column */}
              <View style={styles.inputColumn}>
                <Text style={styles.columnHeader}>BRUT</Text>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Horaire</Text>
                  <TextInput
                    style={styles.input}
                    value={getInputValue("brut", "hourly")}
                    onChangeText={(v) => handleValueChange("brut", "hourly", v)}
                    keyboardType="decimal-pad"
                    selectTextOnFocus
                    placeholderTextColor={theme.mutedForeground}
                  />
                  <Text style={styles.inputUnit}>€</Text>
                </View>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Mensuel</Text>
                  <TextInput
                    style={styles.input}
                    value={getInputValue("brut", "monthly")}
                    onChangeText={(v) =>
                      handleValueChange("brut", "monthly", v)
                    }
                    keyboardType="decimal-pad"
                    selectTextOnFocus
                    placeholderTextColor={theme.mutedForeground}
                  />
                  <Text style={styles.inputUnit}>€</Text>
                </View>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Annuel</Text>
                  <TextInput
                    style={styles.input}
                    value={getInputValue("brut", "yearly")}
                    onChangeText={(v) => handleValueChange("brut", "yearly", v)}
                    keyboardType="decimal-pad"
                    selectTextOnFocus
                    placeholderTextColor={theme.mutedForeground}
                  />
                  <Text style={styles.inputUnit}>€</Text>
                </View>
              </View>

              <View style={styles.columnDivider} />

              {/* Net column */}
              <View style={styles.inputColumn}>
                <Text style={styles.columnHeader}>NET</Text>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Horaire</Text>
                  <TextInput
                    style={styles.input}
                    value={getInputValue("net", "hourly")}
                    onChangeText={(v) => handleValueChange("net", "hourly", v)}
                    keyboardType="decimal-pad"
                    selectTextOnFocus
                    placeholderTextColor={theme.mutedForeground}
                  />
                  <Text style={styles.inputUnit}>€</Text>
                </View>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Mensuel</Text>
                  <TextInput
                    style={styles.input}
                    value={getInputValue("net", "monthly")}
                    onChangeText={(v) => handleValueChange("net", "monthly", v)}
                    keyboardType="decimal-pad"
                    selectTextOnFocus
                    placeholderTextColor={theme.mutedForeground}
                  />
                  <Text style={styles.inputUnit}>€</Text>
                </View>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Annuel</Text>
                  <TextInput
                    style={styles.input}
                    value={getInputValue("net", "yearly")}
                    onChangeText={(v) => handleValueChange("net", "yearly", v)}
                    keyboardType="decimal-pad"
                    selectTextOnFocus
                    placeholderTextColor={theme.mutedForeground}
                  />
                  <Text style={styles.inputUnit}>€</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Statut & Paramètres card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Statut & Paramètres</Text>

            {/* Status grid 3x2 */}
            <View style={styles.statusGrid}>
              {STATUS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.statusButton,
                    status === opt.key && styles.statusButtonActive,
                  ]}
                  onPress={() => setStatus(opt.key)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.radioCircle,
                      status === opt.key && styles.radioCircleActive,
                    ]}
                  >
                    {status === opt.key && <View style={styles.radioDot} />}
                  </View>
                  <Text
                    style={[
                      styles.statusLabel,
                      status === opt.key && styles.statusLabelActive,
                    ]}
                    numberOfLines={2}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Hours slider */}
            <View style={styles.sliderSection}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Temps de travail</Text>
                <Text style={styles.sliderValue}>
                  {hoursPerWeek}h/sem · {workPercent}%
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={10}
                maximumValue={100}
                step={5}
                value={workPercent}
                onValueChange={setWorkPercent}
                minimumTrackTintColor={theme.primary}
                maximumTrackTintColor={theme.border}
                thumbTintColor={theme.primary}
              />
              <View style={styles.sliderTicks}>
                <Text style={styles.sliderTick}>10%</Text>
                <Text style={styles.sliderTick}>50%</Text>
                <Text style={styles.sliderTick}>100%</Text>
              </View>
            </View>

            {/* Tax slider */}
            <View style={styles.sliderSection}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Taux PAS (impôt)</Text>
                <Text style={styles.sliderValue}>{taxRate}%</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={45}
                step={1}
                value={taxRate}
                onValueChange={setTaxRate}
                minimumTrackTintColor={theme.primary}
                maximumTrackTintColor={theme.border}
                thumbTintColor={theme.primary}
              />
              <View style={styles.sliderTicks}>
                <Text style={styles.sliderTick}>0%</Text>
                <Text style={styles.sliderTick}>11%</Text>
                <Text style={styles.sliderTick}>30%</Text>
                <Text style={styles.sliderTick}>45%</Text>
              </View>
            </View>

            {/* Prime input */}
            <View style={styles.primeRow}>
              <Text style={styles.sliderLabel}>Prime annuelle</Text>
              <View style={styles.primeInputWrapper}>
                <TextInput
                  style={styles.primeInput}
                  value={prime === 0 ? "" : prime.toString()}
                  onChangeText={(v) => {
                    const cleaned = v.replace(",", ".").replace(/[^0-9.]/g, "");
                    setPrime(parseFloat(cleaned) || 0);
                  }}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={theme.mutedForeground}
                />
                <Text style={styles.primeUnit}>€</Text>
              </View>
            </View>
          </View>

          {/* Results card */}
          <View style={[styles.card, styles.resultCard]}>
            <Text style={styles.resultLabel}>Net mensuel après impôt</Text>
            <Text style={styles.resultMain}>
              {formatCurrency(monthlyNetAfterTax)} €
            </Text>

            <View style={styles.resultDivider} />

            <View style={styles.resultRow}>
              <View style={styles.resultItem}>
                <Text style={styles.resultItemLabel}>Net annuel</Text>
                <Text style={styles.resultItemValue}>
                  {formatCurrency(yearlyNetAfterTax)} €
                </Text>
              </View>
              <View style={styles.resultItemDivider} />
              <View style={styles.resultItem}>
                <Text style={styles.resultItemLabel}>Cotisations</Text>
                <Text style={styles.resultItemValue}>
                  {(values.charges * 100).toFixed(1)}%
                </Text>
              </View>
              <View style={styles.resultItemDivider} />
              <View style={styles.resultItem}>
                <Text style={styles.resultItemLabel}>Impôt PAS</Text>
                <Text style={styles.resultItemValue}>{taxRate}%</Text>
              </View>
            </View>

            {prime > 0 && (
              <>
                <View style={styles.resultDivider} />
                <View style={styles.primeResultRow}>
                  <Text style={styles.resultItemLabel}>Annuel avec prime</Text>
                  <Text style={styles.resultItemValue}>
                    {formatCurrency(state.annualNetWithPrime)} €
                  </Text>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    resetButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: theme.muted,
    },
    resetText: {
      fontSize: 13,
      color: theme.mutedForeground,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.foreground,
      marginBottom: 14,
    },
    inputGrid: {
      flexDirection: "row",
    },
    inputColumn: {
      flex: 1,
    },
    columnDivider: {
      width: 1,
      backgroundColor: theme.border,
      marginHorizontal: 12,
    },
    columnHeader: {
      fontSize: 11,
      fontWeight: "700",
      color: theme.mutedForeground,
      textAlign: "center",
      marginBottom: 10,
      letterSpacing: 1,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    inputLabel: {
      width: 50,
      fontSize: 11,
      color: theme.mutedForeground,
    },
    input: {
      flex: 1,
      height: 36,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 6,
      paddingHorizontal: 8,
      fontSize: 13,
      color: theme.foreground,
      backgroundColor: theme.background,
    },
    inputUnit: {
      marginLeft: 4,
      fontSize: 12,
      color: theme.mutedForeground,
      width: 12,
    },
    statusGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },
    statusButton: {
      width: "31%",
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 8,
      gap: 6,
      backgroundColor: theme.background,
    },
    statusButtonActive: {
      borderColor: theme.primary,
      backgroundColor: theme.primary + "10",
    },
    radioCircle: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
    },
    radioCircleActive: {
      borderColor: theme.primary,
    },
    radioDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.primary,
    },
    statusLabel: {
      flex: 1,
      fontSize: 11,
      color: theme.mutedForeground,
      lineHeight: 14,
    },
    statusLabelActive: {
      color: theme.primary,
      fontWeight: "600",
    },
    sliderSection: {
      marginBottom: 16,
    },
    sliderHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    sliderLabel: {
      fontSize: 13,
      fontWeight: "500",
      color: theme.foreground,
    },
    sliderValue: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.primary,
    },
    slider: {
      width: "100%",
      height: 36,
    },
    sliderTicks: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: -4,
    },
    sliderTick: {
      fontSize: 10,
      color: theme.mutedForeground,
    },
    primeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    primeInputWrapper: {
      flexDirection: "row",
      alignItems: "center",
    },
    primeInput: {
      width: 100,
      height: 36,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 6,
      paddingHorizontal: 10,
      fontSize: 14,
      color: theme.foreground,
      backgroundColor: theme.background,
      textAlign: "right",
    },
    primeUnit: {
      marginLeft: 6,
      fontSize: 13,
      color: theme.mutedForeground,
    },
    resultCard: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    resultLabel: {
      fontSize: 13,
      color: "rgba(255,255,255,0.8)",
      marginBottom: 4,
    },
    resultMain: {
      fontSize: 40,
      fontWeight: "800",
      color: "#FFFFFF",
      marginBottom: 4,
    },
    resultDivider: {
      height: 1,
      backgroundColor: "rgba(255,255,255,0.2)",
      marginVertical: 12,
    },
    resultRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    resultItem: {
      flex: 1,
      alignItems: "center",
    },
    resultItemDivider: {
      width: 1,
      height: 32,
      backgroundColor: "rgba(255,255,255,0.2)",
    },
    resultItemLabel: {
      fontSize: 11,
      color: "rgba(255,255,255,0.7)",
      marginBottom: 2,
    },
    resultItemValue: {
      fontSize: 15,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    primeResultRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
  });
}
