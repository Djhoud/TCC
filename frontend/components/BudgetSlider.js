import Slider from "@react-native-community/slider";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function BudgetSlider({ budget, setBudget }) {
  return (
    <View style={styles.sliderContainer}>
      <Text style={styles.label}>Orçamento</Text>
      <Text style={styles.budgetText}>R${budget}</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={5000}
        step={100}
        value={budget}
        onValueChange={setBudget}
        minimumTrackTintColor="#3A8FFF"
        maximumTrackTintColor="#ccc"
      />
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
});
