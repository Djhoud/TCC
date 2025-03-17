import { StyleSheet, TextInput, TouchableOpacity, Text, View } from "react-native";

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      {}
      <View style={styles.topArea}>
        <Text style={styles.welcomeText}>Bem-vndo</Text> {}
      </View>

      {}
      <View style={styles.content}>
        <TextInput placeholder="Email" style={styles.input} placeholderTextColor="#666" />
        <TextInput placeholder="Senha" secureTextEntry style={styles.input} placeholderTextColor="#666" />
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity>
          <Text style={styles.link}>
            Não tem conta? <Text style={styles.linkBold}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0000", 
  },
  topArea: {
    height: "60%", 
    justifyContent: "center", 
    alignItems: "center", 
  },
  welcomeText: {
    fontSize: 35, 
    fontWeight: "bold", 
    color: "#ffff", 
  },
  content: {
    height: "60%", 
    backgroundColor: "#fff", 
    borderTopLeftRadius: 0, 
    borderTopRightRadius: 0, 
    paddingHorizontal: 160, 
    justifyContent: "center", 
    alignItems: "center", 
  },
  input: {
    width: "360%", 
    height: 80,
    backgroundColor: "#F2F2F2", 
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  button: {
    marginTop: 40,
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    width: "200%", 
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
  },
  link: {
    color: "#007AFF",
    marginTop: 30,
    fontSize: 15,
  },
  linkBold: {
    fontWeight: "bold",
  },
});