  import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useContext, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import CloudBackground from "../components/CloudBackground";
import Navbar from "../components/Navbar";
import TravelCard from "../components/TravelCard";
import { AuthContext } from "../contexts/AuthContext";

  const { width } = Dimensions.get("window");

  export default function ProfileScreen() {
    const { user, signOut } = useContext(AuthContext);
    const [searchQuery, setSearchQuery] = useState("");
    const navigation = useNavigation();

    const travels = [];

  const handleLogout = async () => {
    Alert.alert(
      "Sair da Conta",
      "Tem certeza que deseja sair? Você precisará fazer login novamente para acessar seus dados.",
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => console.log('Logout cancelado pelo usuário')
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              console.log('Iniciando processo de logout...');
              
              // 🔥 PRIMEIRO: Limpar os dados localmente
              await AsyncStorage.multiRemove(['userToken', 'userPreferences', 'userId']);
              console.log('Dados locais removidos');
              
              // 🔥 SEGUNDO: Chamar signOut do contexto (se existir)
              if (signOut) {
                await signOut();
                console.log('signOut do contexto executado');
              }
              
              // 🔥 TERCEIRO: Redirecionar PARA A TELA DE LOGIN
              console.log('Redirecionando para Login...');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
              
            } catch (error) {
              console.error("Erro durante o logout:", error);
              
              // 🔥 FALLBACK: Se der erro, tenta redirecionar mesmo assim
              Alert.alert(
                "Aviso", 
                "Saindo da conta...",
                [{ 
                  text: "OK",
                  onPress: () => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Login' }],
                    });
                  }
                }]
              );
            }
          }
        }
      ],
      { 
        cancelable: true,
        onDismiss: () => console.log('Alerta de logout fechado pelo usuário')
      }
    );
  };

  const pages = [
    {
      key: "1",
      content: (
        <>
          <LabeledInput label="Nome" value={user?.name || ''} />
          <LabeledInput label="E-mail" value={user?.email || ''} />
          <LabeledInput label="Senha" value="********" secureTextEntry />
          <LabeledInput label="CPF" value={user?.cpf || ''} />
          
          {/* 🔥 BOTÕES LADO A LADO */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Editar Perfil</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Sair</Text>
            </TouchableOpacity>
          </View>
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
          <Image source={{ uri: user?.photo || 'https://via.placeholder.com/160' }} style={styles.avatar} />
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
    
    // 🔥 NOVOS ESTILOS PARA BOTÕES LADO A LADO
    buttonsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 20,
      paddingHorizontal: 10,
    },
    editButton: {
      backgroundColor: "#2E72CC",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      height: 50,
      flex: 1,
      marginRight: 10,
      alignItems: "center",
      justifyContent: "center",
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    editButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16
    },
    logoutButton: {
      backgroundColor: '#dc3545',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      height: 50,
      flex: 1,
      marginLeft: 10,
      alignItems: "center",
      justifyContent: "center",
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    logoutButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    
    emptyHistoryText: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16,
      color: '#888',
    }
  });