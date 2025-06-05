import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
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
    console.log("--- DEBUG ConfirmationScreen useEffect ---");
    console.log("route.params:", route.params);

    if (route?.params?.packageData) {
      setPackageData(route.params.packageData);
      setLoading(false);
    } else {
      const fakeData = {
        destination: "Gramado, RS",
        dateIn: "20/06/2025", // Ajustado para 'dateIn'
        dateOut: "27/06/2025", // Ajustado para 'dateOut'
        items: {
          destinationTransport: { tipo: "Ônibus executivo", preco_total: "300.00" },
          accommodation: { nome: "Hotel dos Sonhos - 4 estrelas", preco: "1200.00" },
          food: [{ descricao: "Café da manhã incluso", preco: "0.00" }, { descricao: "Jantar incluso", preco: "0.00" }],
          activities: [
            { nome: "Tour de Chocolate", preco: "150.00" },
            { nome: "Passeio de Maria-Fumaça", preco: "200.00" },
            { nome: "Jantar Temático", preco: "100.00" },
          ],
          localTransport: { tipo: "Uber", preco: "50.00" },
          interests: [],
          events: [],
        },
        totalCost: "1799.00",
      };

      setTimeout(() => {
        setPackageData(fakeData);
        setLoading(false);
      }, 1000);
    }
  }, [route.params]);

  const goHome = () => {
    navigation.navigate("Home");
  };

  const goToEdit = () => {
    if (packageData) {
      navigation.navigate("EditPackage", { packageData });
    } else {
      console.warn("packageData é nulo, não é possível navegar para EditPackage.");
    }
  };

  if (loading || !packageData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3A8FFF" />
        <Text>Carregando pacote...</Text>
      </View>
    );
  }

  const { destination, items, totalCost } = packageData; // Não desestruture dateIn/dateOut daqui se não vêm diretamente no topo do objeto packageData
  const { accommodation, food, localTransport, destinationTransport, activities, interests, events } = items;

  // Use as datas diretamente de packageData, se o backend as enviar, ou ajuste para onde elas estão
  const departureDate = packageData.dateIn || "Não Informado";
  const returnDate = packageData.dateOut || "Não Informado";

  return (
    <View style={styles.container}>
      <CloudBackReverseUp />
      <View style={styles.topArea}>
        <Text style={styles.title}>Pacote Confirmado!</Text>
      </View>

      {/* AQUI ESTÁ A MUDANÇA: use contentContainerStyle */}
      <ScrollView
        style={styles.bottomAreaScrollView} // Este estilo define o container da rolagem (altura, cor de fundo)
        contentContainerStyle={styles.bottomAreaContentContainer} // Este estilo define o layout dos filhos
      >
        <View style={styles.card}>
          <Text style={styles.label}>Destino:</Text>
          <Text style={styles.value}>{destination}</Text>

          <Text style={styles.label}>Data de Ida:</Text>
          <Text style={styles.value}>{departureDate}</Text>

          <Text style={styles.label}>Data de Volta:</Text>
          <Text style={styles.value}>{returnDate}</Text>

          {destinationTransport && (
            <>
              <Text style={styles.label}>Transporte para Destino:</Text>
              <Text style={styles.value}>
                {destinationTransport.tipo || "Não informado"} - R$ {parseFloat(destinationTransport.preco_total || '0').toFixed(2)}
              </Text>
            </>
          )}

          {accommodation && (
            <>
              <Text style={styles.label}>Hospedagem:</Text>
              <Text style={styles.value}>
                {accommodation.nome || "Não informado"} - R$ {parseFloat(accommodation.preco || '0').toFixed(2)}
              </Text>
              <Text style={styles.value}>
                {accommodation.categoria || "Não informado"} em {accommodation.cidade}
              </Text>
            </>
          )}

          {food && food.length > 0 && (
            <>
              <Text style={styles.label}>Opções de Alimentação:</Text>
              {food.map((f, i) => (
                <Text key={`food-${i}`} style={styles.value}>
                  • {f.descricao || f.tipo || "Item de alimentação"} - R$ {parseFloat(f.preco || '0').toFixed(2)}
                </Text>
              ))}
            </>
          )}

          {localTransport && (
            <>
              <Text style={styles.label}>Transporte Local:</Text>
              <Text style={styles.value}>
                {localTransport.tipo || "Não informado"} - R$ {parseFloat(localTransport.preco || '0').toFixed(2)}
              </Text>
            </>
          )}

          {activities && activities.length > 0 && (
            <>
              <Text style={styles.label}>Atividades Incluídas:</Text>
              {activities.map((item, i) => (
                <Text key={`activity-${i}`} style={styles.value}>
                  • {item.nome || item.descricao || "Atividade"} - R$ {parseFloat(item.preco || '0').toFixed(2)}
                </Text>
              ))}
            </>
          )}

          {interests && interests.length > 0 && (
            <>
              <Text style={styles.label}>Interesses Sugeridos:</Text>
              {interests.map((item, i) => (
                <Text key={`interest-${i}`} style={styles.value}>
                  • {item.nome || item.descricao || "Interesse"} - R$ {parseFloat(item.preco || '0').toFixed(2)}
                </Text>
              ))}
            </>
          )}

          {events && events.length > 0 && (
            <>
              <Text style={styles.label}>Eventos Sugeridos:</Text>
              {events.map((item, i) => (
                <Text key={`event-${i}`} style={styles.value}>
                  • {item.nome || item.descricao || "Evento"} - R$ {parseFloat(item.preco || '0').toFixed(2)}
                </Text>
              ))}
            </>
          )}

          <Text style={styles.label}>Valor Total:</Text>
          <Text style={styles.total}>R$ {parseFloat(totalCost || '0').toFixed(2)}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={goHome}>
            <Text style={styles.buttonText}>Voltar para início</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton} onPress={goToEdit}>
            <Text style={styles.buttonText}>Editar pacote</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  // NOVO ESTILO PARA O ScrollView
  bottomAreaScrollView: {
    height: "70%", // Ou flex: 1, dependendo do layout desejado
    backgroundColor: "#3A8FFF",
  },
  // ESTILO PARA O CONTEÚDO DO ScrollView
  bottomAreaContentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: "center", // <<-- ESTE FOI MOVIDO PARA CÁ
    // justifyContent: "space-between", // Remova se não precisar disto para os filhos, pois o ScrollView lida com a rolagem
  },
  card: {
    backgroundColor: "#f1f1f1",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 360,
    alignSelf: "center", // `alignSelf` funciona em filhos de `contentContainerStyle`
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
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    maxWidth: 600,
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#1D4780",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  editButton: {
    backgroundColor: "#2465B0",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});