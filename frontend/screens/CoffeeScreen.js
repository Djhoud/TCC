// src/screens/CoffeeScreen.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Navbar from "../components/Navbar";


export default function CoffeeScreen() {
  return (

    <View style={styles.container}>
      <Text style={styles.text}>Coffee Screen</Text>
      <Navbar />
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "600",
    color: "#6F4E37",
  },
});
