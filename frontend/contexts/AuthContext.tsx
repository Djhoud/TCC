// src/contexts/AuthContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Alert } from 'react-native'; // Certifique-se de importar Alert


const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL; // Ajuste o nome da variável se for diferente no seu .env

interface AuthContextType {
  token: string | null;
  userId: number | null;
  preferenciasCompletas: boolean | null;
  signIn: (token: string, userId: number, prefsCompleted: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  updatePreferencesStatus: (status: boolean) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  login: (email: string, senha: string) => Promise<boolean>;
  register: (nome: string, email: string, senha: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [preferenciasCompletas, setPreferenciasCompletas] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStoredData = async () => {
      setIsLoading(true); // Garante que isLoading está true ao iniciar
      try {
        const storedToken = await AsyncStorage.getItem("userToken");
        const storedUserId = await AsyncStorage.getItem("userId");
        const storedPrefsCompleted = await AsyncStorage.getItem("preferenciasCompletas");

        if (storedToken && storedUserId) {
          setToken(storedToken);
          setUserId(parseInt(storedUserId, 10));
          setPreferenciasCompletas(storedPrefsCompleted === 'true');

          // Verificação de status de preferência no backend (com try/catch para erros de rede)
          try {
            const response = await fetch(`${API_BASE_URL}/api/preferences/status`, {
              headers: { Authorization: `Bearer ${storedToken}` },
            });
            const data = await response.json();
            if (response.ok) {
              setPreferenciasCompletas(data.hasCompletedPreferences);
            } else {
              if (response.status === 403 || response.status === 401) {
                console.warn('Token inválido ou expirado durante verificação de preferências, fazendo logout.');
                await signOut();
              } else {
                console.error('Erro ao verificar status de preferências:', data);
              }
            }
          } catch (apiError: any) {
            console.error('Erro de rede ao verificar status de preferências:', apiError);
            // Não faz signOut automático aqui para evitar loops em caso de servidor offline
          }
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

  const signIn = async (userToken: string, id: number, prefsCompleted: boolean) => {
    try {
      await AsyncStorage.setItem('userToken', userToken);
      await AsyncStorage.setItem('userId', id.toString());
      await AsyncStorage.setItem('preferenciasCompletas', prefsCompleted.toString());
      setToken(userToken);
      setUserId(id);
      setPreferenciasCompletas(prefsCompleted);
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
      const loginUrl = `${API_BASE_URL}/auth/login`; // Confirme este endpoint no seu backend

      console.log("--- DEBUG REQUISIÇÃO DE LOGIN (AuthContext) ---");
      console.log("URL de Login:", loginUrl);
      console.log("Dados enviados (email):", email); // Não logue senhas em produção!

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      console.log("Status da Resposta de Login:", response.status);

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || 'Falha no login: credenciais inválidas ou erro desconhecido.';
        console.error("Erro na resposta do servidor de login:", responseData);
        throw new Error(errorMessage); // Lança um erro para ser pego pelo catch
      }

      console.log("Login bem-sucedido. Resposta do Servidor:", responseData);

      // Certifique-se de que o backend retorna `id` e `preferenciasCompletas`
      await signIn(responseData.token, responseData.userId || responseData.id, responseData.preferenciasCompletas);

      return true;
    } catch (err: any) {
      console.error("Erro na Requisição de Login (AuthContext - DETALHES):", err);
      if (err.message.includes('Network request failed') || err.message.includes('API_BASE_URL não configurado')) {
        setError(err.message); // Exibe o erro de rede ou de configuração
        Alert.alert("Erro de Conexão", err.message || "Não foi possível conectar ao servidor. Verifique sua internet ou se o servidor está ativo.");
      } else {
        setError(err.message || 'Ocorreu um erro desconhecido ao tentar logar.');
        Alert.alert("Erro no Login", err.message || "Ocorreu um erro desconhecido ao tentar logar.");
      }
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
      const registerUrl = `${API_BASE_URL}/auth/register`; // Confirme este endpoint no seu backend

      console.log("--- DEBUG REQUISIÇÃO DE REGISTRO (AuthContext) ---");
      console.log("URL de Registro:", registerUrl);
      console.log("Dados enviados (nome, email):", { nome, email });

      const response = await fetch(registerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, email, senha }),
      });

      console.log("Status da Resposta de Registro:", response.status);

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || 'Falha no registro: por favor, tente novamente.';
        console.error("Erro na resposta do servidor de registro:", responseData);
        throw new Error(errorMessage);
      }

      console.log("Registro bem-sucedido. Resposta do Servidor:", responseData);
      await signIn(responseData.token, responseData.userId || responseData.id, responseData.preferenciasCompletas);

      return true;
    } catch (err: any) {
      console.error("Erro na Requisição de Registro (AuthContext - DETALHES):", err);
      if (err.message.includes('Network request failed') || err.message.includes('API_BASE_URL não configurado')) {
        setError(err.message);
        Alert.alert("Erro de Conexão", err.message || "Não foi possível conectar ao servidor. Verifique sua internet ou se o servidor está ativo.");
      } else {
        setError(err.message || 'Ocorreu um erro desconhecido ao tentar registrar.');
        Alert.alert("Erro no Registro", err.message || "Ocorreu um erro desconhecido ao tentar registrar.");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      token,
      userId,
      preferenciasCompletas,
      signIn,
      signOut,
      updatePreferencesStatus,
      isLoading,
      error,
      login,
      register,
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