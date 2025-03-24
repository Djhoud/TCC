import React from "react";
import { StyleSheet, View } from "react-native";
import "react-native-gesture-handler";
import AppNavigator from "../Navi/AppNavigator"; // Navegação

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <AppNavigator />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, // Ocupa toda a tela sem quebrar a hierarquia
  },
});
