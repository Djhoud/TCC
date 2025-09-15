// frontend/app/components/BudgetSlider.js
import Slider from "@react-native-community/slider";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function BudgetSlider({ budget, setBudget, minimumValue, maximumValue }) {
  // Formata o valor do orçamento com delimitadores de milhar e símbolo R$
  const formattedBudget = budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <View style={styles.sliderContainer}>
      <Text style={styles.label}>Orçamento</Text>
      <Text style={styles.budgetText}>{formattedBudget}</Text>
      <Slider
        style={styles.slider}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={100}
        value={budget}
        onValueChange={setBudget}
        minimumTrackTintColor="#3A8FFF"
        maximumTrackTintColor="#ccc"
      />
      <View style={styles.rangeTextContainer}>
        <Text style={styles.rangeText}>Mín: {minimumValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</Text>
        <Text style={styles.rangeText}>Máx: {maximumValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sliderContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 5,
  },
  budgetText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3A8FFF",
    marginVertical: 5,
  },
  slider: {
    width: "80%",
    height: 40,
  },
  rangeTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 5,
  },
  rangeText: {
    fontSize: 14,
    color: '#666',
  },
});