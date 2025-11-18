// Arquivo: src/Navi/AppNavigator.tsx
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

// Importe todas as suas telas (confirmando os nomes que você usou)
import CoffeeScreen from '../screens/CoffeeScreen';
import ConfirmationScreen from '../screens/ConfirmationScreen';
import LoginScreen from '../screens/LoginScreen';
import MainScreen from '../screens/MainScreen';
import PackageDetailScreen from '../screens/PackageDetailScreen';
import PreferenceScreen from '../screens/PreferenceScreen';
import SearchScreen from '../screens/SearchScreen';
import TravelBudgetScreen from '../screens/TravelBudgetScreen';
import ProfileScreen from '../screens/UserScreen';

const Stack = createStackNavigator();

interface AppNavigatorProps {
  isAuthenticated: boolean;
  hasCompletedPreferences: boolean;
}

const AppNavigator = ({ isAuthenticated, hasCompletedPreferences }: AppNavigatorProps) => {
  let initialRouteName;
  if (isAuthenticated && hasCompletedPreferences) {
    initialRouteName = 'Main';
  } else if (isAuthenticated && !hasCompletedPreferences) {
    initialRouteName = 'Preference';
  } else {
    initialRouteName = 'Login';
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRouteName}
      id={undefined} // <<<<<<<<<< Adicione esta linha de volta!
    >
      {/* Telas de Autenticação e Cadastro (Públicas) */}
      <Stack.Screen name="Login" component={LoginScreen} />
      {/*<Stack.Screen name="Register" component={RegisterScreen} />*/}
      <Stack.Screen name="Preference" component={PreferenceScreen} />

      {/* Telas Principais do Aplicativo (Privadas) */}
      <Stack.Screen name="Main" component={MainScreen} />
      <Stack.Screen name="Budget" component={TravelBudgetScreen} />
      <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
      <Stack.Screen name="Coffee" component={CoffeeScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="PackageDetail" component={PackageDetailScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;