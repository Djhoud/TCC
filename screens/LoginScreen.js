import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      {}
      <View style={styles.topArea}>
        <Text style={styles.welcomeText}>Entrar</Text> {}
      </View>

      {}
      <View style={styles.content}>
        <TextInput placeholder="Email" style={styles.input} placeholderTextColor="#666" />
        <TextInput placeholder="Senha" secureTextEntry style={styles.input} placeholderTextColor="#666" />
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity>
          <Text style={styles.link}> <Text style={styles.linkBold}>Cadastre-se</Text>
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
    height: "50%", 
    justifyContent: "center", 
    alignItems: "center", 
  },
  welcomeText: {
    fontSize: 70, 
    fontWeight: "bold", 
    color: "#ffff", 
  },
  content: {
    height: "50%", 
    backgroundColor: "#fff", 
    borderTopLeftRadius: 0, 
    borderTopRightRadius: 0, 
    paddingHorizontal: 160, 
    justifyContent: "center", 
    alignItems: "center", 
  },
  input: {
    width: "350%", 
    height: 80,
    backgroundColor: "#F2F2F2", 
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  button: {
    marginTop: 40,
    backgroundColor: "#1D4780",
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
    flexShrink: 1
  },
  linkBold: {
    fontWeight: "bold",
  },
});