import { FontAwesome } from '@expo/vector-icons';
import React, { useContext, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import CloudBackground from "../components/CloudBackground";
import { AuthContext } from '../contexts/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading, error } = useContext(AuthContext);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    const success = await register(name, email, password);
    if (success) {
      Alert.alert('Sucesso', 'Conta criada e logada com sucesso!');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* CloudBackground dentro do ScrollView para subir junto */}
        <View style={styles.backgroundContainer}>
          <CloudBackground />
        </View>
        
        <View style={styles.topArea}>
          <Text style={styles.welcomeText}>Cadastre-se</Text>
        </View>
        <View style={styles.content}>
          <TextInput
            placeholder="Nome"
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor="#666"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            blurOnSubmit={false}
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#666"
            returnKeyType="next"
            ref={emailRef}
            onSubmitEditing={() => passwordRef.current?.focus()}
            blurOnSubmit={false}
          />
          
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.passwordInput}
              placeholderTextColor="#666"
              returnKeyType="next"
              ref={passwordRef}
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              blurOnSubmit={false}
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

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Confirmar Senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              style={styles.passwordInput}
              placeholderTextColor="#666"
              returnKeyType="done"
              ref={confirmPasswordRef}
              onSubmitEditing={handleRegister}
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={toggleShowConfirmPassword}
            >
              <FontAwesome 
                name={showConfirmPassword ? "eye-slash" : "eye"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Registrar</Text>
            )}
          </TouchableOpacity>
          
          {error && <Text style={styles.errorMessage}>{error}</Text>}
          
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>
              <Text style={styles.linkBold}>Já tem conta? Fazer Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  topArea: {
    height: 280,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3A8FFF",
    zIndex: 2,
  },
  welcomeText: {
    fontSize: 70,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 30,
    paddingBottom: 50,
    minHeight: 600,
    zIndex: 2,
  },
  input: {
    width: 320,
    height: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 15,
    borderColor: "#323D4D",
    borderWidth: 0.5,
    marginTop: 15,
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
    marginTop: 15,
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
    marginTop: 30,
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
  errorMessage: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});