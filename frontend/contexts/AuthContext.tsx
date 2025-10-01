import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Alert } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

interface User {
  name: string;
  email: string;
  cpf: string | null;
  photo: string | null;
}

interface AuthContextType {
  token: string | null;
  userId: number | null;
  user: User | null;
  preferenciasCompletas: boolean | null;
  signIn: (token: string, userId: number, prefsCompleted: boolean, userProfile: User) => Promise<void>;
  signOut: () => Promise<void>;
  updatePreferencesStatus: (status: boolean) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  login: (email: string, senha: string) => Promise<boolean>;
  register: (nome: string, email: string, senha: string) => Promise<boolean>;
  fetchUser: () => Promise<void>;
  API_BASE_URL: string; // Adicione esta propriedade
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null); // Novo estado para os dados do usuário
  const [preferenciasCompletas, setPreferenciasCompletas] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async (userToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (response.ok) {
        const userData: User = await response.json();
        setUser(userData);
      } else {
        console.error('Erro ao buscar perfil do usuário:', response.status);
      }
    } catch (apiError) {
      console.error('Erro de rede ao buscar perfil:', apiError);
    }
  };

  useEffect(() => {
    const loadStoredData = async () => {
      setIsLoading(true);
      try {
        const storedToken = await AsyncStorage.getItem("userToken");
        const storedUserId = await AsyncStorage.getItem("userId");
        const storedPrefsCompleted = await AsyncStorage.getItem("preferenciasCompletas");

        if (storedToken && storedUserId) {
          setToken(storedToken);
          setUserId(parseInt(storedUserId, 10));
          setPreferenciasCompletas(storedPrefsCompleted === 'true');
          await fetchUser(storedToken); // Chama para buscar o perfil ao carregar
        }
      } catch (e: any) {
        setError("Erro ao carregar sessão anterior: " + e.message);
        console.error('Erro ao carregar dados do AsyncStorage:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredData();
  }, []);

  const signIn = async (userToken: string, id: number, prefsCompleted: boolean, userProfile: User) => {
    try {
      await AsyncStorage.setItem('userToken', userToken);
      await AsyncStorage.setItem('userId', id.toString());
      await AsyncStorage.setItem('preferenciasCompletas', prefsCompleted.toString());
      setToken(userToken);
      setUserId(id);
      setPreferenciasCompletas(prefsCompleted);
      setUser(userProfile);
      setError(null);
      console.log('Dados de login salvos e contexto atualizado.');
    } catch (e: any) {
      setError('Erro ao salvar dados de login: ' + e.message);
      console.error('Erro ao salvar dados de login no AsyncStorage:', e);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.clear();
      setToken(null);
      setUserId(null);
      setUser(null);
      setPreferenciasCompletas(false);
      setError(null);
      console.log('Sessão encerrada e AsyncStorage limpo.');
    } catch (e: any) {
      setError('Erro ao finalizar sessão: ' + e.message);
      console.error('Erro ao limpar AsyncStorage no signOut:', e);
    }
  };

  const updatePreferencesStatus = async (status: boolean) => {
    try {
      await AsyncStorage.setItem('preferenciasCompletas', status.toString());
      setPreferenciasCompletas(status);
      console.log('Status de preferências atualizado.');
    } catch (e: any) {
      setError('Erro ao atualizar status de preferências: ' + e.message);
      console.error('Erro ao atualizar status de preferências no AsyncStorage:', e);
    }
  };

  const login = async (email: string, senha: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!API_BASE_URL) {
        throw new Error("API_BASE_URL não configurado. Verifique seu arquivo .env");
      }
      const loginUrl = `${API_BASE_URL}/auth/login`;

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || 'Falha no login: credenciais inválidas ou erro desconhecido.';
        throw new Error(errorMessage);
      }

      const userProfile: User = {
        name: responseData.name,
        email: responseData.email,
        cpf: responseData.cpf,
        photo: responseData.photo,
      };

      await signIn(responseData.token, responseData.userId || responseData.id, responseData.preferenciasCompletas, userProfile);
      return true;
    } catch (err: any) {
      console.error("Erro na Requisição de Login:", err);
      setError(err.message || 'Ocorreu um erro desconhecido ao tentar logar.');
      Alert.alert("Erro", err.message || "Não foi possível conectar ao servidor.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (nome: string, email: string, senha: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!API_BASE_URL) {
        throw new Error("API_BASE_URL não configurado para registro. Verifique seu arquivo .env");
      }
      const registerUrl = `${API_BASE_URL}/auth/register`;

      const response = await fetch(registerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || 'Falha no registro: por favor, tente novamente.';
        throw new Error(errorMessage);
      }

      const userProfile: User = {
        name: responseData.name,
        email: responseData.email,
        cpf: responseData.cpf,
        photo: responseData.photo,
      };

      await signIn(responseData.token, responseData.userId || responseData.id, responseData.preferenciasCompletas, userProfile);
      return true;
    } catch (err: any) {
      console.error("Erro na Requisição de Registro:", err);
      setError(err.message || 'Ocorreu um erro desconhecido ao tentar registrar.');
      Alert.alert("Erro", err.message || "Não foi possível conectar ao servidor.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      token,
      userId,
      user, // Adicione o novo estado do usuário
      preferenciasCompletas,
      signIn,
      signOut,
      updatePreferencesStatus,
      isLoading,
      error,
      login,
      register,
      fetchUser: () => fetchUser(token || ''), // Garante que a função é tipada
      API_BASE_URL: API_BASE_URL || '' // Passa a URL para o contexto
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};