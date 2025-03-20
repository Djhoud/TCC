import { FontAwesome } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.topArea}>
        <Text style={styles.welcomeText}>Entrar</Text>
      </View>

      <View style={styles.content}>
        <TextInput placeholder="Email" style={styles.input} placeholderTextColor="#666" />
        <TextInput placeholder="Senha" secureTextEntry style={styles.input} placeholderTextColor="#666" />

        <TouchableOpacity style={{ alignSelf: "flex-end", marginBottom: 20 }}>
  <Text style={{ color: "#007AFF", fontSize: 15 }}>Esqueceu sua senha?</Text>
</TouchableOpacity>


        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity>
          <Text style={styles.link}><Text style={styles.linkBold}>Cadastre-se</Text></Text>
        </TouchableOpacity>

        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity style={[styles.socialButton, styles.google]}>
            <FontAwesome name="google" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialButton, styles.facebook]}>
            <FontAwesome name="facebook" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialButton, styles.twitter]}>
            <FontAwesome name="twitter" size={24} color="white" />
          </TouchableOpacity>
        </View>
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
    height: "43%",
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 70,
    fontWeight: "bold",
    color: "#ffff",
  },
  content: {
    height: "100%",
    backgroundColor: "#fff",
    paddingHorizontal: 160,
    alignItems: "center",
  },
  input: {
    width: 320,
    height: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderColor: "#323D4D",
    borderWidth: 0.5,
  },
  button: {
    marginTop: 40,
    backgroundColor: "#1D4780",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    width: 200,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
  },
  link: {
    color: "#007AFF",
    marginTop: 20,
    fontSize: 15,
  },
  linkBold: {
    fontWeight: "bold",
  },
  socialButtonsContainer: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
  },
  
  
  socialButton: {
    width: 60,
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  google: {
    backgroundColor: "#DB4437",
  },
  facebook: {
    backgroundColor: "#3B5998",
  },
  twitter: {
    backgroundColor: "#3C3C3C",
  },
});
