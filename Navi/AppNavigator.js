import SearchScreen from "@/screens/SearchScreen";
import SplashScreen from "@/screens/SplashScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import CoffeeScreen from "../screens/CoffeeScreen";
import LoginScreen from "../screens/LoginScreen";
import MainScreen from "../screens/MainScreen"; // Importando a MainScreen
import PreferenceScreen from "../screens/PreferenceScreen";
import TravelBudgetScreen from "../screens/TravelBudgetScreen";
import UserScreen from "../screens/UserScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="User"> 
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}/>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}/>
        <Stack.Screen
          name="Preference"
          component={PreferenceScreen}
          options={{ headerShown: false }}/> 
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{ headerShown: false }}/>
        <Stack.Screen
          name="Budget"
          component={TravelBudgetScreen}
          options={{ headerShown: false }}/>
        <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ headerShown: false }}/>
        <Stack.Screen
          name="Coffee"
          component={CoffeeScreen}
          options={{ headerShown: false }}/>
        <Stack.Screen
          name="User"
          component={UserScreen}
          options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
