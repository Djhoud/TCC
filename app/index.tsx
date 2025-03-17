import React from "react";
import { StyleSheet, View } from "react-native";
import CloudBackground from "../components/CloudBackground";
import LoginScreen from "../screens/LoginScreen.js";

export default function App() {
  return (
    <View style={styles.container}>
      <CloudBackground /> {}
      <LoginScreen /> {}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3A8FFF", 
  },
});
