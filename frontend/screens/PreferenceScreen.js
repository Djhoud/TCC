import { useNavigation } from '@react-navigation/native'; // <-- Adicione esta importação
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import CloudBackReverse from "../components/CloudBackReverse";
import { AuthContext } from "../contexts/AuthContext";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function PreferenceScreen() {
  const { token, userId, updatePreferencesStatus, signOut } = useContext(AuthContext);
  const navigation = useNavigation(); // <-- Adicione esta linha para obter o objeto de navegação

  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState({
    accommodation_preferences: [],
    food_preferences: [],
    local_transport_preferences: [],
    destination_transport_preferences: [],
    activity_preferences: [],
    interests: [],
  });
  const [loading, setLoading] = useState(false);
  const [fetchingExistingPrefs, setFetchingExistingPrefs] = useState(true);

  const steps = [
    // ... (Seus steps, sem alterações)
    {
      title: "Qual tipo de acomodação você prefere?",
      field: "accommodation_preferences",
      options: [
        "Hotel de Luxo", "Pousada Aconchegante", "Resort com Tudo Incluído",
        "Hostel Econômico", "Apartamento Alugado", "Casa de Temporada",
        "Camping", "Glamping",
      ],
    },
    {
      title: "Qual seus tipos de comidas favoritas?",
      field: "food_preferences",
      options: [
        "Culinária Local/Regional", "Japonesa", "Italiana",
        "Brasileira Tradicional", "Francesa", "Mexicana",
        "Indiana", "Vegetariana/Vegana", "Frutos do Mar",
        "Fast Food",
      ],
    },
    {
      title: "Como você prefere se locomover no local?",
      field: "local_transport_preferences",
      options: [
        "Carro Alugado", "Transporte Público (Ônibus/Metrô)", "Táxi/Aplicativo",
        "Bicicleta", "Caminhada", "Moto",
        "Trem Local", "Barco/Ferry",
      ],
    },
    {
      title: "Como você prefere viajar até o local?",
      field: "destination_transport_preferences",
      options: [
        "Avião", "Carro Próprio", "Ônibus de Viagem",
        "Trem de Longa Distância", "Cruzeiro", "Van Compartilhada",
      ],
    },
    {
      title: "Quais atividades você gosta de fazer?",
      field: "activity_preferences",
      options: [
        "Tour Cultural/Histórico", "Shows/Eventos", "Vida Noturna/Baladas",
        "Compras", "Cinema/Teatro", "Esportes Radicais",
        "Relaxamento/Spa", "Aventura na Natureza", "Gastronomia/Degustação",
      ],
    },
    {
      title: "Quais são seus principais interesses de viagem?",
      field: "interests",
      options: [
        "Praia/Sol", "Trilhas/Montanhas", "Caminhada/Exploração",
        "Museus/Galerias de Arte", "Parques/Jardins", "Natureza/Vida Selvagem",
        "Cidades Grandes", "Vilarejos Pequenos", "História Antiga",
        "Modernidade/Tecnologia",
      ],
    },
  ];

  // ... (Seu useEffect para loadUserPreferences, sem alterações)
  useEffect(() => {
    const loadUserPreferences = async () => {
      setFetchingExistingPrefs(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/preferences/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok && data.preferences) {
          setPreferences(data.preferences);
        } else if (!response.ok) {
          if (response.status !== 404) {
            Alert.alert('Erro', data.message || 'Não foi possível carregar suas preferências anteriores.');
          }
        }
      } catch (error) {
        Alert.alert('Erro', 'Erro de rede ao carregar preferências.');
      } finally {
        setFetchingExistingPrefs(false);
      }
    };
    loadUserPreferences();
  }, [token, userId]);


  const handleSelect = (option) => {
    const field = steps[currentStep].field;
    setPreferences((prev) => {
      const current = [...(prev[field] || [])];
      const index = current.indexOf(option);

      if (index >= 0) {
        current.splice(index, 1);
      } else if (current.length < 3) {
        current.push(option);
      }

      return {
        ...prev,
        [field]: current,
      };
    });
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/preferences/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ preferences: preferences }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Erro ao salvar preferências.");
      }

      await updatePreferencesStatus(true);
      Alert.alert("Sucesso", "Preferências salvas com sucesso!");
      
      // *** ADICIONE AQUI A NAVEGAÇÃO ***
      // Isso substituirá a tela de preferências na pilha por 'Budget'.
      // Se você quer que o usuário vá para a MainScreen após as preferências, mude para 'Main'.
      // Se você quer que ele vá para a tela de busca de pacote, mude para 'Search'.
      navigation.replace('Budget'); // ou 'Main' ou 'Search', dependendo do seu fluxo

    } catch (error) {
      Alert.alert("Erro", error.message || "Erro ao salvar preferências.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const currentField = steps[currentStep].field;
    if (!preferences[currentField] || preferences[currentField].length === 0) {
      Alert.alert("Atenção", "Por favor, selecione pelo menos uma opção para continuar.");
      return;
    }

    if (currentStep === steps.length - 1) {
      handleSavePreferences();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // ... (Restante do seu componente, sem alterações)
  if (fetchingExistingPrefs) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando suas preferências...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CloudBackReverse />
      <View style={styles.topArea}>
        <Text style={styles.title}>{steps[currentStep].title}</Text>
      </View>

      <View style={styles.bottomArea}>
        <View style={styles.stepsContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.stepIndicator,
                index === currentStep && styles.activeStepIndicator,
              ]}
            />
          ))}
        </View>

        <View style={styles.flatListWrapper}>
          <FlatList
            data={steps[currentStep].options}
            numColumns={2}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.optionsContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                style={[
                  styles.option,
                  preferences[steps[currentStep].field]?.includes(item) && styles.selectedOption,
                ]}
              >
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <Text style={styles.selectionLimitText}>Selecione no máximo 3 opções</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.navButton} disabled={currentStep === 0}>
            <Text style={styles.navButtonText}>Voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.navButtonText}>
                {currentStep === steps.length - 1 ? "Finalizar" : "Próximo"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutButtonText}>Deslogar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ... (Seus estilos, sem alterações)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  },
  topArea: {
    height: "40%",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#007AFF",
    textAlign: "center",
  },
  bottomArea: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#3A8FFF",
  },
  stepsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  stepIndicator: {
    width: 10,
    height: 5,
    borderRadius: 5,
    backgroundColor: "#ccc",
    marginHorizontal: 5,
  },
  activeStepIndicator: {
    backgroundColor: "#007AFF",
  },
  flatListWrapper: {
    flex: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  optionsContainer: {
    paddingBottom: 20,
  },
  option: {
    margin: 8,
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    width: 140,
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#ADD8E6",
    borderColor: "#007AFF",
    borderWidth: 2,
  },
  optionText: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
  },
  selectionLimitText: {
    fontSize: 13,
    color: "white",
    textAlign: "center",
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  navButton: {
    backgroundColor: "#1D4780",
    padding: 18,
    borderRadius: 8,
    width: "40%",
    marginBottom: 60,
    alignItems: "center",
  },
  navButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});