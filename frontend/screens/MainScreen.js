import { FontAwesome5 } from '@expo/vector-icons'; // Importar ícones
import { useNavigation } from "@react-navigation/native";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CloudBackReverse from "../components/CloudBackReverse";
import Navbar from "../components/Navbar";

export default function MainScreen() {
  const navigation = useNavigation();

  // Dados de exemplo para o carrossel
  const travelPackages = [
    {
      id: "1",
      image: require("../assets/images/component/rio.png"),
      title: "Rio de Janeiro",
      price: "R$2.999",
      description: "Explore o Rio de Janeiro com nosso pacote completo.",
    },
    {
      id: "2",
      image: require("../assets/images/component/gramado.png"),
      title: "Gramado",
      price: "R$3.499",
      description: "Aproveite Gramado com hospedagem e passeios incluídos.",
    },
  ];

  return (
    <View style={styles.container}>
      <CloudBackReverse />
      <View style={styles.topArea}>
        <Text style={styles.title}>Sua viagem do seu jeito!</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Budget")}>
          <Text style={styles.buttonText}>SUA VIAGEM!</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomArea}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PACOTES POPULARES</Text>
          <TouchableOpacity 
            style={styles.circularButton}
            onPress={() => navigation.navigate("PopularTravels")}
          >
            <FontAwesome5 name="arrow-right" size={20} color="#3A8FFF" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={travelPackages}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={item.image} style={styles.cardImage} />
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardPrice}>{item.price}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </View>
          )}
        />
      </View>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    zIndex: 1,
  },
  topArea: {
    height: "40%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingTop: 40,
    zIndex: 1,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#3A8FFF",
    textAlign: "center",
  },
  button: {
    marginTop: 40,
    backgroundColor: "#3A8FFF",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 5,
    borderColor: '#2E72CC',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: "#1D4780",
    shadowOffset: {
        width: 1,
        height: 5,
    },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
    textAlign: 'center',
    zIndex: 1,
  },
  bottomArea: {
    height: "55%",
    backgroundColor: "#3A8FFF",
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 33,
    marginHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    zIndex: 5,
  },
  circularButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  card: {
    width: 220,
    height: 330,
    backgroundColor: "#fff",
    padding: 10,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },
  cardImage: {
    width: "100%",
    height: 180,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E63946",
    marginTop: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
});