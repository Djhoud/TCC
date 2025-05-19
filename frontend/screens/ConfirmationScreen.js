import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import CloudBackReverseUp from "../components/CloudBackReverseUp";
import Navbar from "../components/Navbar";

 export default function ConfirmationScreen({ route, navigation }) {
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (route?.params?.packageData) {
      setPackageData(route.params.packageData);
      setLoading(false);
    } else {
      const fakeData = {
        destination: "Gramado, RS",
        departureDate: "20/06/2025",
        returnDate: "27/06/2025",
        transport: "Ônibus executivo",
        hotel: "Hotel dos Sonhos - 4 estrelas",
        food: "Café da manhã e jantar inclusos",
        attractions: [
          "Tour de Chocolate",
          "Passeio de Maria-Fumaça",
          "Jantar Temático",
        ],
        price: "R$ 1.799,00",
      };

      setTimeout(() => {
        setPackageData(fakeData);
        setLoading(false);
      }, 1000);
    }
  }, []);

  const goHome = () => {
    navigation.navigate("Home");
  };

  const goToEdit = () => {
    navigation.navigate("EditPackage", { packageData });
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3A8FFF" />
        <Text>Carregando pacote...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CloudBackReverseUp />
      <View style={styles.topArea}>
        <Text style={styles.title}>Pacote Confirmado!</Text>
      </View>

      <View style={styles.bottomArea}>
        <View style={styles.card}>
          <Text style={styles.label}>Destino:</Text>
          <Text style={styles.value}>{packageData.destination}</Text>

          <Text style={styles.label}>Data de Ida:</Text>
          <Text style={styles.value}>{packageData.departureDate}</Text>

          <Text style={styles.label}>Data de Volta:</Text>
          <Text style={styles.value}>{packageData.returnDate}</Text>

          <Text style={styles.label}>Transporte:</Text>
          <Text style={styles.value}>{packageData.transport}</Text>

          <Text style={styles.label}>Hospedagem:</Text>
          <Text style={styles.value}>{packageData.hotel}</Text>

          <Text style={styles.label}>Alimentação:</Text>
          <Text style={styles.value}>{packageData.food}</Text>

          <Text style={styles.label}>Atrações Incluídas:</Text>
          {packageData.attractions.map((item, i) => (
            <Text key={i} style={styles.value}>• {item}</Text>
          ))}
          <Text style={styles.label}>Valor Total:</Text>
          <Text style={styles.total}>{packageData.price}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={goHome}>
            <Text style={styles.buttonText}>Voltar para início</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton} onPress={goToEdit}>
            <Text style={styles.buttonText}>Editar pacote</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#3A8FFF",
    marginBottom: 20,
    textAlign: "center",
  },
  topArea: {
    paddingTop: 60,
    paddingBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    zIndex: 1,
    height: "25%",
  },
  bottomArea: {
    height: "70%",
    backgroundColor: "#3A8FFF",
    paddingHorizontal: 20,
    paddingVertical: 30,
    justifyContent: "space-between",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#f1f1f1",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
    marginBottom: 20,
  },
  label: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 10,
    color: "#444",
  },
  value: {
    fontSize: 16,
    color: "#555",
  },
  total: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: "row", // Alinha os itens horizontalmente
    width: "100%",
    justifyContent: "space-between", // Espaça os botões igualmente
    maxWidth: 600, // Para evitar que os botões fiquem muito largos em telas grandes
  },
  button: {
    backgroundColor: "#1D4780",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    flex: 1, // Permite que os botões se expandam igualmente
    marginRight: 10, // Adiciona um espaço entre os botões
  },
  editButton: {
    backgroundColor: "#2465B0",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    flex: 1, // Permite que os botões se expandam igualmente
    marginLeft: 10, // Adiciona um espaço entre os botões
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center", // Centraliza o texto dentro do botão
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});