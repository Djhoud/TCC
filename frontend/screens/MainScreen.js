import { useNavigation } from "@react-navigation/native";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CloudBackReverse from "../components/CloudBackReverse"; // Verifica se o caminho está correto
import Navbar from "../components/Navbar";

export default function MainScreen() {
  const navigation = useNavigation();

  // Dados de exemplo para o carrossel
  const travelPackages = [
    {
      id: "1",
      image: require("../assets/images/component/rio.png"), // Confirma que a imagem existe no caminho
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
        <Text style={styles.sectionTitle}>PACOTES POPULARES</Text>
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
    height: "40%",  // Ajustando a altura para um valor menor
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingTop: 40,
    zIndex: 1,
  },
  title: {
    fontSize: 42,  // Mantendo o tamanho da fonte
    fontWeight: "bold",
    color: "#3A8FFF",
    textAlign: "center",
  },
  button: {
    marginTop: 40,
    backgroundColor: "#3A8FFF", // Cor chamativa do botão
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 5,
    boxShadow: '1px 5px 0px 4px #1D4780',
    borderColor: '#2E72CC', // Cor da borda interna
    alignItems: 'center', // Alinha o texto no centro
    justifyContent: 'center', // Centraliza o texto no botão
    transition: 'background-color 0.3s ease', // Animação suave da cor de fundo
    zIndex: 2,
  },
  buttonText: {
    color: "#fff", // Cor do texto
    fontWeight: "bold",
    fontSize: 20,
    textAlign: 'center',
    zIndex:1, // Centraliza o texto
  },
  bottomArea: {
    height: "55%",  // Ajuste proporcional da área inferior
    backgroundColor: "#3A8FFF",
    padding: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    marginTop:33,
    marginLeft: 10,
    zIndex:5,
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