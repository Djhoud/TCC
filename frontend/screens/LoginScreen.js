import { FontAwesome } from '@expo/vector-icons';
import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import CloudBackground from "../components/CloudBackground";
import { AuthContext } from "../contexts/AuthContext";

export default function LoginScreen({ navigation }) {
  const { 
    login, 
    isLoading, 
    error, 
    loginWithGoogle  // ✅ AGORA SÓ ISSO
  } = useContext(AuthContext);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false); // ✅ ESTADO LOCAL

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }
    await login(email, password);
  };

  // 🔥 FUNÇÃO PARA LOGIN COM GOOGLE (ATUALIZADA)
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const success = await loginWithGoogle();
      if (!success) {
        Alert.alert("Erro", "Não foi possível fazer login com Google");
      }
    } catch (error) {
      Alert.alert("Erro", "Erro ao conectar com Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={styles.container}>
      <CloudBackground />
      <View style={styles.topArea}>
        <Text style={styles.welcomeText}>Entrar</Text>
      </View>
      <View style={styles.content}>
        <TextInput
          placeholder="Email"
          style={styles.input}
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Senha"
            secureTextEntry={!showPassword}
            style={styles.passwordInput}
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={toggleShowPassword}
          >
            <FontAwesome 
              name={showPassword ? "eye-slash" : "eye"} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={{ alignSelf: "flex-end", marginBottom: 20 }}>
          <Text style={{ color: "#007AFF", fontSize: 15 }}>Esqueceu sua senha?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        {error && <Text style={styles.errorMessage}>{error}</Text>}

        {/* 🔥 DIVISÓRIA "OU" */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OU</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* 🔥 BOTÕES DE LOGIN SOCIAL ATUALIZADOS */}
        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity 
            style={[styles.socialButton, styles.google, googleLoading && styles.disabledButton]}
            onPress={handleGoogleLogin}
            disabled={googleLoading || isLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <FontAwesome name="google" size={24} color="white" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.socialButton, styles.facebook]}
            onPress={() => Alert.alert("Em breve", "Login com Facebook em desenvolvimento")}
            disabled={isLoading || googleLoading}
          >
            <FontAwesome name="facebook" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.socialButton, styles.twitter]}
            onPress={() => Alert.alert("Em breve", "Login com Twitter em desenvolvimento")}
            disabled={isLoading || googleLoading}
          >
            <FontAwesome name="twitter" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>
            <Text style={styles.linkBold}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topArea: {
    height: "43%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3A8FFF",
  },
  welcomeText: {
    fontSize: 70,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    height: "57%",
    backgroundColor: "#fff",
    paddingHorizontal: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    paddingTop: 15,
  },
  input: {
    width: 320,
    height: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 15,
    borderColor: "#323D4D",
    borderWidth: 0.5,
    marginTop: 5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 320,
    height: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderColor: "#323D4D",
    borderWidth: 0.5,
    marginTop: 5,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    height: '100%',
  },
  eyeIcon: {
    padding: 10,
    marginRight: 5,
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
  // 🔥 NOVOS ESTILOS PARA DIVISÓRIA
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  socialButton: {
    width: 60,
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
    disabledButton: {
    opacity: 0.6,
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
  errorMessage: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});