// src/screens/UserScreen.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function UserScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela do Usuário</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F0FF",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1D4780",
  },
});
