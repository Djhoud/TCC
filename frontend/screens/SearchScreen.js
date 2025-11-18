import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'; // ✅ ADICIONE ESTA LINHA
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CloudBackReverse from "../components/CloudBackReverse";
import Navbar from "../components/Navbar";
import TravelCard from "../components/TravelCard";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [publicPackages, setPublicPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation(); // ✅ ADICIONE ESTA LINHA

  // ✅ CARREGAR PACOTES PÚBLICOS
  const loadPublicPackages = async () => {
    try {
      const publicData = await AsyncStorage.getItem('publicPackages');
      if (publicData) {
        const parsedPackages = JSON.parse(publicData);
        setPublicPackages(parsedPackages);
      }
    } catch (error) {
      console.error('Erro ao carregar pacotes públicos:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CARREGAR AO MONTAR A TELA
  useEffect(() => {
    loadPublicPackages();
  }, []);

  // ✅ RECARREGAR QUANDO A TELA GANHAR FOCO
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPublicPackages();
    });

    return unsubscribe;
  }, [navigation]); // ✅ ADICIONE navigation COMO DEPENDÊNCIA

  const filteredTravels = publicPackages.filter((travel) =>
    travel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    travel.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Área Superior */}
      <View style={styles.topArea}>
        <CloudBackReverse />
        <Text style={styles.header}>Buscar Viagens</Text>
        <TextInput
          placeholder="Digite o nome da viagem ou destino..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.input}
        />
      </View>

      {/* Área Inferior */}
      <View style={styles.bottomArea}>
        {loading ? (
          <Text style={styles.loadingText}>Carregando viagens públicas...</Text>
        ) : (
          <FlatList
            data={filteredTravels}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.travelCardContainer}>
                <TravelCard travel={item} />
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 100 }}
            style={{ width: "100%" }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {searchQuery 
                  ? 'Nenhuma viagem pública encontrada.' 
                  : 'Ainda não há viagens públicas disponíveis.'
                }
              </Text>
            }
          />
        )}
      </View>

      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topArea: {
    height: 350,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    backgroundColor: "#fff",
  },
  bottomArea: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: "#3A8FFF",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6F4E37",
    marginBottom: 10,
    zIndex: 2,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    color: "#333",
    zIndex: 2,
  },
  travelCardContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 50,
  },
  loadingText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 50,
  },
});