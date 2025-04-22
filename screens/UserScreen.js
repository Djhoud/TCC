import React from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CloudBackground from "../components/CloudBackground";
import Navbar from "../components/Navbar";
import TravelCard from "../components/TravelCard";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const user = {
    name: "Usuario_01",
    email: "Usuario_01@gmail.com",
    password: "12********",
    cpf: "24834512177",
    photo: "https://i.pravatar.cc/150?img=12",
  };

  // Viagens mockadas
  const travels = [
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
    {
      id: "5",
      title: "Safari no Cerrado",
      location: "Jalapão",
      date: "22/09/2025",
      stars: 4,
      image: "https://images.unsplash.com/photo-1583241951264-fd3ee67f72ec",
    },
  ];

  const pages = [
    {
      key: "1",
      content: (
        <>
          <LabeledInput label="Nome" value={user.name} />
          <LabeledInput label="E-mail" value={user.email} />
          <LabeledInput label="Senha" value={user.password} secureTextEntry />
          <LabeledInput label="CPF" value={user.cpf} />

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Editar</Text>
          </TouchableOpacity>
        </>
      ),
    },
    {
      key: "2",
      content: (
        <FlatList
          data={travels}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity>
              <TravelCard travel={item} />
            </TouchableOpacity>
          )}
          contentContainerStyle={{
            paddingBottom: 50,
            paddingTop: 10,
            gap: 10,
          }}
          showsVerticalScrollIndicator={false}
        />
      ),
    }
  ];

  return (
    <View style={styles.container}>
      <CloudBackground />

      <View style={styles.topArea}>
        <Image source={{ uri: user.photo }} style={styles.avatar} />
        <Text style={styles.title}>{user.name}</Text>
      </View>

      <FlatList
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={styles.page}>
            {item.content}
          </View>
        )}
        style={styles.bottomArea}
      />

      <Navbar style={styles.navbar} />
    </View>
  );
}

function LabeledInput({ label, value, secureTextEntry = false }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        secureTextEntry={secureTextEntry}
        editable={false}
      />
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3A8FFF",
    paddingTop: 40,
    zIndex: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 15,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: "#fff",
  },
  bottomArea: {
    flexGrow: 0,
    height: "55%",
    zIndex: 1,
  },
  page: {
    width: width,
    backgroundColor: "#fff",
    padding: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  label: {
    fontWeight: "600",
    color: "#3C3C3C",
    marginBottom: 5,
    marginLeft: 30,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 55,
    marginTop: -5,
    width: 300,
    alignSelf: "center",
    fontSize: 16,
    color: "#3C3C3C",
    borderWidth: 0.5,
  },
  button: {
    marginTop: 2,
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 10,
    width: "50%",
    height: 50,
    borderWidth: 0.5,
    borderColor: "#2E72CC",
    alignItems: "center",
    alignSelf: "center",
  },
  buttonText: {
    color: "#2E72CC",
    fontWeight: "bold",
    fontSize: 16,
  },
  navbar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
});
