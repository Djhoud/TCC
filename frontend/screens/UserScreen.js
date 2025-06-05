import React, { useContext, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image, // Manter Image para o avatar
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
// Removendo imports de imagens fake, pois não são mais usadas aqui
// import florianopolis from "../assets/images/component/florianopolis.png";
// import gramado from "../assets/images/component/gramado.png";
// import rio from "../assets/images/component/rio.png";
// import salvador from "../assets/images/component/salvador.png";
// import saopaulo from "../assets/images/component/saopaulo.png";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import CloudBackground from "../components/CloudBackground";
import Navbar from "../components/Navbar";
import TravelCard from "../components/TravelCard";
import { AuthContext } from "../contexts/AuthContext";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation();

  const travels = [];

  const handleLogout = async () => {
    Alert.alert(
      "Deslogar",
      "Tem certeza que deseja sair?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Sim",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userToken');
              console.log('Token do usuário removido do AsyncStorage.');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (e) {
              console.error("Erro ao remover token do AsyncStorage:", e);
              Alert.alert("Erro", "Não foi possível deslogar. Tente novamente.");
            }
          }
        }
      ]
    );
  };

  const pages = [
    {
      key: "1",
      content: (
        <>
          {/* Adicionei 'user?' para verificar se 'user' existe antes de acessar suas propriedades */}
          {/* Se 'user' for null/undefined, 'user?.name' será undefined, e '|| ''' fornecerá uma string vazia */}
          <LabeledInput label="Nome" value={user?.name || ''} />
          <LabeledInput label="E-mail" value={user?.email || ''} />
          <LabeledInput label="Senha" value="********" secureTextEntry />
          <LabeledInput label="CPF" value={user?.cpf || ''} />
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Deslogar</Text>
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
            ListEmptyComponent={() => (
              <Text style={styles.emptyHistoryText}>Nenhum histórico de viagem encontrado.</Text>
            )}
          />
        </View>
      ),
    }
  ];

  return (
    <View style={styles.container}>
      <CloudBackground />
      <View style={styles.topArea}>
        {/* Use user?.photo para evitar erro se user for null/undefined */}
        <Image source={{ uri: user?.photo || 'https://via.placeholder.com/160' }} style={styles.avatar} />
        {/* Use user?.name para evitar erro se user for null/undefined */}
        <Text style={styles.title}>{user?.name || 'Usuário'}</Text>
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
  logoutButton: {
    backgroundColor: '#dc3545',
    borderColor: '#dc3545',
    marginTop: 15,
  },
  logoutButtonText: {
    color: '#fff',
  },
  emptyHistoryText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  }
});