// Arquivo: app/index.tsx
import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { ActivityIndicator, LogBox, StyleSheet, Text, View } from "react-native";
import "react-native-gesture-handler";

import AppNavigator from "../Navi/AppNavigator";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

// ✅ SILENCIADOR DE ERROS - coloque SEMPRE no topo após imports
LogBox.ignoreLogs([
  'Text strings must be rendered within a <Text> component.',
  'JSON Parse error',
  'symbolicate'
]);

// ✅ DEBUG GLOBAL - apenas para desenvolvimento
if (__DEV__) {
  const originalFetch = global.fetch;
  global.fetch = async (url: any, options?: any) => {
    console.log('🔍 FETCH REQUEST:', {
      url: url,
      method: options?.method || 'GET',
    });

    try {
      const response = await originalFetch(url, options);
      
      console.log('📡 FETCH RESPONSE:', {
        url: url,
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type')
      });

      const clonedResponse = response.clone();
      const text = await clonedResponse.text();
      
      console.log('📄 RESPONSE BODY (primeiros 200 chars):', text.substring(0, 200));
      
      if (!response.headers.get('content-type')?.includes('application/json')) {
        console.log('❌ RESPOSTA NÃO É JSON! URL:', url);
      }

      return response;
    } catch (error: any) {
      console.log('💥 FETCH ERROR:', error.message, 'URL:', url);
      throw error;
    }
  };
}

// ✅ COMPONENTE PRINCIPAL
function AppContent() {
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
        isAuthenticated={!!token}
        hasCompletedPreferences={preferenciasCompletas || false} 
      />
    </NavigationContainer>
  );
}

// ✅ APP PRINCIPAL
export default function App() {
  return (
    <View style={styles.container}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </View>
  );
}

// ✅ ESTILOS
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