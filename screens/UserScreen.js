import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import florianopolis from "../assets/images/component/florianopolis.png";
import gramado from "../assets/images/component/gramado.png";
import rio from "../assets/images/component/rio.png";
import salvador from "../assets/images/component/salvador.png";
import saopaulo from "../assets/images/component/saopaulo.png";
import CloudBackground from "../components/CloudBackground";
import Navbar from "../components/Navbar";
import TravelCard from "../components/TravelCard";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const user = {
    name: "Usuario_01",
    email: "Usuario_01@gmail.com",
    password: "12********",
    cpf: "24834512177",
    photo: "https://i.pravatar.cc/150?img=12"
  };

  const travels = [
    {
      id: "1",
      title: "Viagem dos Sonhos",
      location: "Rio de Janeiro",
      date: "24/12/2024",
      stars: 4,
      image: rio
    },
    {
      id: "2",
      title: "Trilha Selvagem",
      location: "Chapada Diamantina",
      date: "10/01/2025",
      stars: 5,
      image: saopaulo
    },
    {
      id: "3",
      title: "Cidade Encantada",
      location: "Gramado",
      date: "14/07/2025",
      stars: 3,
      image: gramado
    },
    {
      id: "4",
      title: "Aventura Gelada",
      location: "Patagônia",
      date: "05/08/2025",
      stars: 5,
      image: salvador
    },
    {
      id: "5",
      title: "Safari no Cerrado",
      location: "Jalapão",
      date: "22/09/2025",
      stars: 4,
      image: florianopolis
    }
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
      )
    },
    {
      key: "2",
      content: (
        <View style={{ flex: 1, padding: 20 }}>
          <TextInput
            placeholder="Buscar viagens..."
            placeholderTextColor="#888"
            style={{
              height: 50,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 10,
              paddingHorizontal: 15,
              marginBottom: 15,
            }}
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
          <FlatList
            data={travels.filter((t) =>
              t.title.toLowerCase().includes(searchQuery.toLowerCase())
            )}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity>
                <TravelCard travel={item} />
              </TouchableOpacity>
            )}
            contentContainerStyle={{ gap: 12, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
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
        renderItem={({ item }) => <View style={styles.page}>{item.content}</View>}
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
    backgroundColor: "#fff"
  },
  topArea: {
    height: "40%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3A8FFF",
    paddingTop: 40,
    zIndex: 0
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 15
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: "#fff"
  },
  bottomArea: {
    flexGrow: 0,
    height: "55%",
    zIndex: 1
  },
  page: {
    width: width,
    backgroundColor: "#fff",
    padding: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30
  },
  label: {
    fontWeight: "600",
    color: "#3C3C3C",
    marginBottom: 5,
    marginLeft: 30
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
    borderWidth: 0.5
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
    alignSelf: "center"
  },
  buttonText: {
    color: "#2E72CC",
    fontWeight: "bold",
    fontSize: 16
  },
});
