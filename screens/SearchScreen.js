import React, { useState } from "react";
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

  const travelData = [
    {
      id: "1",
      title: "Viagem dos Sonhos",
      location: "Rio de Janeiro",
      date: "24/12/2024",
      stars: 4,
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    },
    {
      id: "2",
      title: "Trilha Selvagem",
      location: "Chapada Diamantina",
      date: "10/01/2025",
      stars: 5,
      image: "https://images.unsplash.com/photo-1605032652768-f63f57c31e06",
    },
    {
      id: "3",
      title: "Cidade Encantada",
      location: "Gramado",
      date: "14/07/2025",
      stars: 3,
      image: "https://images.unsplash.com/photo-1551907234-70d4fa7c39aa",
    },
    {
      id: "4",
      title: "Aventura Gelada",
      location: "Patagônia",
      date: "05/08/2025",
      stars: 5,
      image: "https://images.unsplash.com/photo-1549887534-2c5b05fe7082",
    },
  ];

  const filteredTravels = travelData.filter((travel) =>
    travel.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Área Superior */}
      <View style={styles.topArea}>
        <CloudBackReverse />
        <Text style={styles.header}>Buscar Viagens</Text>
        <TextInput
          placeholder="Digite o nome da viagem..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.input}
        />
      </View>

      {/* Área Inferior */}
      <View style={styles.bottomArea}>
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
            <Text style={styles.emptyText}>Nenhuma viagem encontrada.</Text>
          }
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
});
