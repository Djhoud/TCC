// Arquivo: app/index.tsx

import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import "react-native-gesture-handler";

import AppNavigator from "../Navi/AppNavigator";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

function RootApp() {
  const { isLoading, token, preferenciasCompletas } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Carregando dados do usuário...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator 
        isAuthenticated={!!token} // <-- CORRIGIDO: de 'isAuthenticate' para 'isAuthenticated'
        hasCompletedPreferences={preferenciasCompletas || false} 
      />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <View style={styles.container}>
      <AuthProvider>
        <RootApp /> 
      </AuthProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});