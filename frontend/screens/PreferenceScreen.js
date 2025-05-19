import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CloudBackReverse from "../components/CloudBackReverse";

export default function PreferenceScreen() {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState({
    food_preferences: [],
    accommodation_preferences: [],
    transport_preferences: [],
    activity_preferences: [],
    interests: [],
  });

  const steps = [
    {
      title: "Qual seus tipos de comidas favoritas?",
      field: "food_preferences",
      options: ["Japonesa", "Italiana", "Brasileira", "Francesa", "Mexicana", "Indiana"],
    },
    {
      title: "Qual tipo de acomodação você prefere?",
      field: "accommodation_preferences",
      options: ["hotel", "pousada", "resort", "hostel", "apartamento", "casa"],
    },
    {
      title: "Como você prefere se locomover?",
      field: "transport_preferences",
    options: ["carro", "ônibus", "moto", "bicicleta", "trem", "avião"],
    },
    {
      title: "Quais atividades você gosta?",
      field: "activity_preferences",
      options: ["tour cultural", "shows", "baladas", "compras", "cinema"],
    },
    {
      title: "O que você mais gosta de fazer?",
      field: "interests",
      options: ["praia", "trilha", "caminhada", "museus", "parques", "natureza"],
    },
  ];

  const handleSelect = (option) => {
    const field = steps[currentStep].field;
    setPreferences((prev) => {
      const current = [...prev[field]];
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
                preferences[steps[currentStep].field].includes(item) && styles.selectedOption,
              ]}
            >
              <Text style={styles.optionText}>{item}</Text>
            </TouchableOpacity>
          )}
        />

        <Text style={styles.selectionLimitText}>Selecione no máximo 3 opções</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.navButton}>
            <Text style={styles.navButtonText}>Voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => {
              if (currentStep === steps.length - 1) {
                console.log(preferences);
                alert("Preferências salvas com sucesso!");
                navigation.navigate("Main");
              } else {
                setCurrentStep((prev) => prev + 1);
              }
            }}
          >
            <Text style={styles.navButtonText}>
              {currentStep === steps.length - 1 ? "Finalizar" : "Próximo"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  optionsContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
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
});
