import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

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

const API_BASE_URL = 'https://3747-170-246-250-79.ngrok-free.app'; // EX: 'https://abcd-efgh-ijkl.ngrok-free.app'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [preferenciasCompletas, setPreferenciasCompletas] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("userToken");
        const storedUserId = await AsyncStorage.getItem("userId");
        const storedPrefsCompleted = await AsyncStorage.getItem("preferenciasCompletas");

        if (storedToken && storedUserId) {
          setToken(storedToken);
          setUserId(parseInt(storedUserId, 10));
          setPreferenciasCompletas(storedPrefsCompleted === 'true');

          try {
            const response = await fetch(`${API_BASE_URL}/api/preferences/status`, {
              headers: { Authorization: `Bearer ${storedToken}` },
            });
            const data = await response.json();
            if (response.ok) {
              setPreferenciasCompletas(data.hasCompletedPreferences);
            } else {
              if (response.status === 403 || response.status === 401) {
                await signOut();
              }
            }
          } catch (apiError) {
          }
        }
      } catch (e) {
        setError("Erro ao carregar sessão anterior.");
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
    } catch (e) {
      setError('Erro ao salvar dados de login.');
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.clear();
      setToken(null);
      setUserId(null);
      setPreferenciasCompletas(false);
      setError(null);
    } catch (e) {
      setError('Erro ao finalizar sessão.');
    }
  };

  const updatePreferencesStatus = async (status: boolean) => {
    try {
      await AsyncStorage.setItem('preferenciasCompletas', status.toString());
      setPreferenciasCompletas(status);
    } catch (e) {
      setError('Erro ao atualizar status de preferências.');
    }
  };

  const login = async (email: string, senha: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const loginUrl = `${API_BASE_URL}/auth/login`;
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Falha no login: credenciais inválidas.');
      }
      
      await signIn(responseData.token, responseData.id, responseData.preferenciasCompletas);

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (nome: string, email: string, senha: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const registerUrl = `${API_BASE_URL}/auth/register`;
      const response = await fetch(registerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, email, senha }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Falha no registro: por favor, tente novamente.');
      }
      
      await signIn(responseData.token, responseData.userId, responseData.preferenciasCompletas);

      return true;
    } catch (err: any) {
      setError(err.message);
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