import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useColorScheme } from "react-native";
import Svg, {
  Path,
  Line,
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { getTheme } from "../constants/theme";

const BENCHMARKS = [
  { label: "SMIC Net", value: 1398 },
  { label: "Médian", value: 2100 },
  { label: "Moyen", value: 2600 },
  { label: "Top 10%", value: 4000 },
  { label: "Top 1%", value: 7000 },
];

const SCALE_MAX = 7000;

const DISTRIBUTION = [
  { salary: 0, density: 0 },
  { salary: 400, density: 0.3 },
  { salary: 700, density: 1.2 },
  { salary: 950, density: 3.2 },
  { salary: 1150, density: 5.8 },
  { salary: 1300, density: 8.5 },
  { salary: 1398, density: 10.2 },
  { salary: 1550, density: 12.1 },
  { salary: 1750, density: 13.5 },
  { salary: 1950, density: 14.0 },
  { salary: 2100, density: 13.0 },
  { salary: 2300, density: 11.0 },
  { salary: 2550, density: 8.8 },
  { salary: 2900, density: 6.2 },
  { salary: 3300, density: 4.0 },
  { salary: 3800, density: 2.5 },
  { salary: 4500, density: 1.4 },
  { salary: 5500, density: 0.65 },
  { salary: 6500, density: 0.25 },
  { salary: 7000, density: 0.1 },
];

const CHART_W = 1000;
const CHART_H = 80;
const MAX_DENSITY = 14.0;

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

interface SocialPyramidProps {
  monthlyNet: number;
}

export function SocialPyramid({ monthlyNet }: SocialPyramidProps) {
  const [chartExpanded, setChartExpanded] = useState(false);
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const styles = makeStyles(theme);

  const screenWidth = Dimensions.get("window").width;
  const chartDisplayWidth = screenWidth - 64;
  const progressWidth = screenWidth - 64;

  const clampedNet = Math.min(monthlyNet, SCALE_MAX);
  const progressPercent = (clampedNet / SCALE_MAX) * 100;

  // Find rank position text
  const getBenchmarkContext = () => {
    for (let i = BENCHMARKS.length - 1; i >= 0; i--) {
      if (clampedNet >= BENCHMARKS[i].value) {
        if (i === BENCHMARKS.length - 1) return `Top 1% des salaires`;
        return `Au-dessus du ${BENCHMARKS[i].label}`;
      }
    }
    return "En dessous du SMIC";
  };

  // Build SVG path
  const mapX = (salary: number) => (salary / SCALE_MAX) * CHART_W;
  const mapY = (density: number) => CHART_H - (density / MAX_DENSITY) * CHART_H;

  const linePoints = DISTRIBUTION.map((d) => ({
    x: mapX(d.salary),
    y: mapY(d.density),
  }));

  const areaPath =
    `M 0 ${CHART_H} ` +
    smoothPath(linePoints).replace("M", "L").slice(1) +
    ` L ${CHART_W} ${CHART_H} Z`;
  const linePath = smoothPath(linePoints);

  const userX = mapX(clampedNet);
  const userY = (() => {
    // interpolate density at userX
    for (let i = 1; i < DISTRIBUTION.length; i++) {
      const prev = DISTRIBUTION[i - 1];
      const curr = DISTRIBUTION[i];
      if (clampedNet >= prev.salary && clampedNet <= curr.salary) {
        const t = (clampedNet - prev.salary) / (curr.salary - prev.salary);
        const density = prev.density + t * (curr.density - prev.density);
        return mapY(density);
      }
    }
    return CHART_H;
  })();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Position salariale</Text>
      <Text style={styles.netValue}>
        {monthlyNet.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
        net/mois
      </Text>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(progressPercent, 100)}%` },
            ]}
          />
        </View>
        <View style={styles.progressLabels}>
          {BENCHMARKS.map((b) => (
            <View
              key={b.label}
              style={[
                styles.benchmarkMarker,
                { left: (b.value / SCALE_MAX) * progressWidth - 20 },
              ]}
            >
              <View style={styles.benchmarkTick} />
              <Text style={styles.benchmarkLabel}>{b.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.contextLabel}>{getBenchmarkContext()}</Text>

      {/* Expandable chart */}
      <TouchableOpacity
        style={styles.expandButton}
        onPress={() => setChartExpanded(!chartExpanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.expandButtonText}>Distribution des salaires</Text>
        <Ionicons
          name={chartExpanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={theme.mutedForeground}
        />
      </TouchableOpacity>

      {chartExpanded && (
        <View style={styles.chartContainer}>
          <Svg
            width={chartDisplayWidth}
            height={60}
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            preserveAspectRatio="none"
          >
            <Defs>
              <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={theme.primary} stopOpacity={0.4} />
                <Stop
                  offset="100%"
                  stopColor={theme.primary}
                  stopOpacity={0.05}
                />
              </LinearGradient>
            </Defs>
            <Path d={areaPath} fill="url(#areaGrad)" />
            <Path
              d={linePath}
              stroke={theme.primary}
              strokeWidth={3}
              fill="none"
            />
            <Line
              x1={userX}
              y1={0}
              x2={userX}
              y2={CHART_H}
              stroke={theme.foreground}
              strokeWidth={2}
              strokeDasharray="6,4"
            />
            <Circle
              cx={userX}
              cy={userY}
              r={5}
              fill={theme.primary}
              stroke={theme.card}
              strokeWidth={2}
            />
          </Svg>
          <View style={styles.chartAxisLabels}>
            <Text style={styles.axisLabel}>0</Text>
            <Text style={styles.axisLabel}>1 750</Text>
            <Text style={styles.axisLabel}>3 500</Text>
            <Text style={styles.axisLabel}>5 250</Text>
            <Text style={styles.axisLabel}>7 000 €</Text>
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
      padding: 16,
      marginBottom: 16,
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.foreground,
      marginBottom: 4,
    },
    netValue: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.primary,
      marginBottom: 16,
    },
    progressContainer: {
      marginBottom: 24,
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.muted,
      borderRadius: 4,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: theme.primary,
      borderRadius: 4,
    },
    progressLabels: {
      position: "relative",
      height: 32,
      marginTop: 4,
    },
    benchmarkMarker: {
      position: "absolute",
      alignItems: "center",
      transform: [{ translateX: -20 }],
    },
    benchmarkTick: {
      width: 1,
      height: 6,
      backgroundColor: theme.mutedForeground,
      marginBottom: 2,
    },
    benchmarkLabel: {
      fontSize: 9,
      color: theme.mutedForeground,
      textAlign: "center",
      width: 50,
    },
    contextLabel: {
      fontSize: 13,
      color: theme.mutedForeground,
      marginBottom: 12,
      textAlign: "center",
    },
    expandButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    expandButtonText: {
      fontSize: 13,
      color: theme.mutedForeground,
      fontWeight: "500",
    },
    chartContainer: {
      marginTop: 12,
    },
    chartAxisLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 4,
    },
    axisLabel: {
      fontSize: 9,
      color: theme.mutedForeground,
    },
  });
}
