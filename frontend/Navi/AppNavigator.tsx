// Arquivo: src/Navi/AppNavigator.tsx
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

// Importe todas as suas telas
import CoffeeScreen from '../screens/CoffeeScreen'; // Confirmar nome exato
import ConfirmationScreen from '../screens/ConfirmationScreen'; // Confirmar nome exato
import LoginScreen from '../screens/LoginScreen';
import MainScreen from '../screens/MainScreen';
import PreferenceScreen from '../screens/PreferenceScreen'; // Note: foi 'PreferencesScreen' em alguns exemplos, confirme o nome exato
import RegisterScreen from '../screens/RegisterScreen';
import SearchScreen from '../screens/SearchScreen'; // Confirmar nome exato
import TravelBudgetScreen from '../screens/TravelBudgetScreen'; // Confirmar nome exato
import UserScreen from '../screens/UserScreen';

const Stack = createStackNavigator();

interface AppNavigatorProps {
  isAuthenticated: boolean;
  hasCompletedPreferences: boolean;
}

const AppNavigator = ({ isAuthenticated, hasCompletedPreferences }: AppNavigatorProps) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} id={undefined}>
      {/* Lógica condicional refatorada para evitar espaços indesejados */}
      {isAuthenticated && hasCompletedPreferences ? (
        // Caso 1: Usuário autenticado E preferências completas -> Telas principais
        <>
          <Stack.Screen name="Main" component={MainScreen} />
          <Stack.Screen name="Budget" component={TravelBudgetScreen} />
          <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
          <Stack.Screen name="Coffee" component={CoffeeScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="User" component={UserScreen} />
        </>
      ) : isAuthenticated && !hasCompletedPreferences ? (
        // Caso 2: Usuário autenticado MAS preferências NÃO completas -> Tela de Preferências
        <Stack.Screen name="Preference" component={PreferenceScreen} />
      ) : (
        // Caso 3: Usuário NÃO autenticado -> Telas de Login/Registro
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;