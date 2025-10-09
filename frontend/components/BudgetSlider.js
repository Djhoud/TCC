// frontend/app/components/BudgetSlider.js
import Slider from "@react-native-community/slider";
import React, { useEffect, useMemo } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const { width: WINDOW_WIDTH } = Dimensions.get("window");

function formatBRL(value) {
  return `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;
}

export default function BudgetSlider({
  budget,
  setBudget,
  minimumValue = 0,
  maximumValue = 1000,
  priceGroups = null,
  step = 100,
  onBudgetRangeUpdate, // <- prop opcional
}) {
  const { derivedMin, derivedMax } = useMemo(() => {
    if (!Array.isArray(priceGroups) || priceGroups.length === 0) {
      return { derivedMin: minimumValue, derivedMax: maximumValue };
    }
    let minSum = 0;
    let maxSum = 0;
    for (const group of priceGroups) {
      if (!Array.isArray(group) || group.length === 0) continue;
      const numeric = group.map((v) => Number(v) || 0);
      minSum += Math.min(...numeric);
      maxSum += Math.max(...numeric);
    }
    if (minSum === maxSum) maxSum = minSum + (step || 100);
    const dMin = Math.max(0, Math.floor(minSum / step) * step);
    const dMax = Math.max(dMin + step, Math.ceil(maxSum / step) * step);
    return { derivedMin: dMin, derivedMax: dMax };
  }, [priceGroups, minimumValue, maximumValue, step]);

  // notifica o pai quando o range derivado mudar, MAS só se for função
  useEffect(() => {
    if (typeof onBudgetRangeUpdate === "function") {
      try {
        onBudgetRangeUpdate(derivedMin, derivedMax);
      } catch (e) {
        // não quebra a UI se o callback falhar
        console.warn("BudgetSlider: onBudgetRangeUpdate falhou:", e);
      }
    }
  }, [derivedMin, derivedMax, onBudgetRangeUpdate]);

  // ajusta budget atual se estiver fora do novo range
  useEffect(() => {
    if (typeof budget !== "number") return;
    if (budget < derivedMin) setBudget(derivedMin);
    else if (budget > derivedMax) setBudget(derivedMax);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [derivedMin, derivedMax]);

  const formattedBudget = formatBRL(budget);
  const formattedMin = formatBRL(derivedMin);
  const formattedMax = formatBRL(derivedMax);

  return (
    <View style={styles.container}>
      <View style={styles.valueBubble}><Text style={styles.valueText}>{formattedBudget}</Text></View>

      <View style={styles.sliderBox}>
        <Slider
          style={styles.slider}
          minimumValue={derivedMin}
          maximumValue={derivedMax}
          step={step}
          value={budget}
          onValueChange={setBudget}
          minimumTrackTintColor="#3A8FFF"
          maximumTrackTintColor="#CFE3FF"
          thumbTintColor="#1D4780"
        />
      </View>

      <View style={styles.rangeContainer}>
        <View style={styles.rangeBox}><Text style={styles.rangeText}>{formattedMin}</Text></View>
        <Text style={styles.separator}>-</Text>
        <View style={styles.rangeBox}><Text style={styles.rangeText}>{formattedMax}</Text></View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { alignItems: "center", marginTop: 12, width: "100%" },
  valueBubble: {
    backgroundColor: "#3A8FFF",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 8,
    alignSelf: "center",
  },
  valueText: { color: "#fff", fontWeight: "700" },

  sliderBox: {
    width: Math.min(WINDOW_WIDTH - 40, 480),
    justifyContent: "center",
    borderRadius: 10,
    paddingVertical: 6,
  },
  slider: { width: "100%", height: 40 },

  rangeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: Math.min(WINDOW_WIDTH - 40, 480),
    marginTop: 8,
    alignItems: "center",
  },
  rangeBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 80,
    alignItems: "center",
  },
  rangeText: { color: "#343a40", fontWeight: "500" },
  separator: { fontSize: 18, color: "#343a40", marginHorizontal: 8 },
});
