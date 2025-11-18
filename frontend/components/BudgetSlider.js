// BudgetSlider.js (Versão Simplificada)
import Slider from "@react-native-community/slider";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const { width: WINDOW_WIDTH } = Dimensions.get("window");

function formatBRL(value) {
  return `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;
}

export default function BudgetSlider({
  budget,
  setBudget,
  minimumValue = 0,
  maximumValue = 5000,
  step = 100,
}) {
  // ✅ REMOVIDO: toda lógica de cálculo local
  // ✅ AGORA: usa apenas os valores passados como props

  const formattedBudget = formatBRL(budget);
  const formattedMin = formatBRL(minimumValue);
  const formattedMax = formatBRL(maximumValue);

  return (
    <View style={styles.container}>
      <View style={styles.valueBubble}>
        <Text style={styles.valueText}>{formattedBudget}</Text>
      </View>

      <View style={styles.sliderBox}>
        <Slider
          style={styles.slider}
          minimumValue={minimumValue}
          maximumValue={maximumValue}
          step={step}
          value={budget}
          onValueChange={setBudget}
          minimumTrackTintColor="#3A8FFF"
          maximumTrackTintColor="#CFE3FF"
          thumbTintColor="#1D4780"
        />
      </View>

      <View style={styles.rangeContainer}>
        <View style={styles.rangeBox}>
          <Text style={styles.rangeText}>{formattedMin}</Text>
        </View>
        <Text style={styles.separator}>-</Text>
        <View style={styles.rangeBox}>
          <Text style={styles.rangeText}>{formattedMax}</Text>
        </View>
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