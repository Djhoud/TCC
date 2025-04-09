// ProfileScreen.tsx
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import CloudBackground from "../components/CloudBackground";
import Navbar from "../components/Navbar";

export default function ProfileScreen() {
  const user = {
    name: "Usuario_01",
    email: "Usuario_01@gmail.com",
    password: "12********",
    cpf: "24834512177",
    photo: "https://i.pravatar.cc/150?img=12",
  };

  return (
    <View style={styles.container}>
      <CloudBackground/>

      <View style={styles.topArea}>
        <Image source={{ uri: user.photo }} style={styles.avatar} />
        <Text style={styles.title}>{user.name}</Text>
      </View>

      <View style={styles.bottomArea}>
      <LabeledInput label="Nome" value={user.name} />
        <LabeledInput label="Email" value={user.email} />
        <LabeledInput label="Senha" value={user.password} secureTextEntry />
        <LabeledInput label="CPF" value={user.cpf} />

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
      </View>

      <Navbar />
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
    zIndex: 1,
  },
  topArea: {
    height: "40%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3A8FFF",
    paddingTop: 40,

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
    height: "55%",
    backgroundColor: "#fff",
    padding: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    zIndex: 1,
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
    width:300,
    alignSelf: "center",
    fontSize: 16,
    color: "#3C3C3C",
    borderWidth:0.5,
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
});
