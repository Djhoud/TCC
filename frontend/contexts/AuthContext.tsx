import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Alert } from "react-native";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

WebBrowser.maybeCompleteAuthSession();

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
  signIn: (
    token: string,
    userId: number,
    prefsCompleted: boolean,
    userProfile: User
  ) => Promise<void>;
  signOut: () => Promise<void>;
  updatePreferencesStatus: (status: boolean) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  login: (email: string, senha: string) => Promise<boolean>;
  register: (nome: string, email: string, senha: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  fetchUser: () => Promise<void>;
  API_BASE_URL: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// ✔ Utilitário para garantir que erro SEMPRE seja string
const safeError = (err: any): string => {
  if (!err) return "Erro desconhecido";
  if (typeof err === "string") return err;
  if (err.message) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [preferenciasCompletas, setPreferenciasCompletas] = useState<
    boolean | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // GOOGLE
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    scopes: ["openid", "profile", "email"],
    redirectUri: "https://auth.expo.io",
  });

  const loginWithGoogle = async (): Promise<boolean> => {
    setError(null);

    try {
      const result = await promptAsync();

      if (result?.type === "success") {
        const { access_token } = result.params;

        const backendResponse = await fetch(
          `${API_BASE_URL}/api/auth/google`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken: access_token }),
          }
        );

        const data = await backendResponse.json();

        if (backendResponse.ok) {
          const userProfile: User = {
            name: data.user?.name || data.nome || "",
            email: data.user?.email || data.email || "",
            cpf: data.user?.cpf || data.documento || null,
            photo: data.user?.photo || data.foto || null,
          };

          await signIn(
            data.token,
            data.userId || data.id,
            data.preferenciasCompletas || false,
            userProfile
          );

          return true;
        } else {
          throw new Error(data.message || "Erro no login com Google");
        }
      }

      return false;
    } catch (err: any) {
      const safeMsg = safeError(err);
      setError(safeMsg);
      Alert.alert("Erro", safeMsg);
      return false;
    }
  };

  useEffect(() => {
    if (response?.type === "error") {
      const safeMsg = safeError(response.error);
      setError(safeMsg);
    }
  }, [response]);

  const fetchUser = async (userToken: string) => {
    if (!userToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (response.ok) {
        const data: User = await response.json();
        setUser(data);
      } else if (response.status === 401) {
        await signOut();
      } else {
        throw new Error(`Erro ao buscar usuário: ${response.status}`);
      }
    } catch (err: any) {
      setError(safeError(err));
    }
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const storedToken = await AsyncStorage.getItem("userToken");
        const storedUserId = await AsyncStorage.getItem("userId");
        const storedPrefs = await AsyncStorage.getItem(
          "preferenciasCompletas"
        );

        if (storedToken && storedUserId) {
          setToken(storedToken);
          setUserId(Number(storedUserId));
          setPreferenciasCompletas(storedPrefs === "true");
          await fetchUser(storedToken);
        }
      } catch (err: any) {
        setError(safeError(err));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const signIn = async (
    userToken: string,
    id: number,
    prefs: boolean,
    userProfile: User
  ) => {
    try {
      await AsyncStorage.setItem("userToken", userToken);
      await AsyncStorage.setItem("userId", id.toString());
      await AsyncStorage.setItem("preferenciasCompletas", prefs.toString());

      setToken(userToken);
      setUserId(id);
      setPreferenciasCompletas(prefs);
      setUser(userProfile);
      setError(null);
    } catch (err: any) {
      setError(safeError(err));
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.clear();
      setToken(null);
      setUser(null);
      setUserId(null);
      setPreferenciasCompletas(false);
      setError(null);
    } catch (err: any) {
      setError(safeError(err));
    }
  };

  const updatePreferencesStatus = async (status: boolean) => {
    try {
      await AsyncStorage.setItem(
        "preferenciasCompletas",
        status.toString()
      );
      setPreferenciasCompletas(status);
    } catch (err: any) {
      setError(safeError(err));
    }
  };

  const login = async (email: string, senha: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!API_BASE_URL) throw new Error("API BASE não configurada");

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Falha no login");
      }

      const userProfile: User = {
        name: data.name,
        email: data.email,
        cpf: data.cpf,
        photo: data.photo,
      };

      await signIn(
        data.token,
        data.userId || data.id,
        data.preferenciasCompletas,
        userProfile
      );

      return true;
    } catch (err: any) {
      const safeMsg = safeError(err);
      setError(safeMsg);
      Alert.alert("Erro", safeMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (nome: string, email: string, senha: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!API_BASE_URL) throw new Error("API BASE não configurada");

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Falha no registro");

      const userProfile: User = {
        name: data.name,
        email: data.email,
        cpf: data.cpf,
        photo: data.photo,
      };

      await signIn(
        data.token,
        data.userId || data.id,
        data.preferenciasCompletas,
        userProfile
      );

      return true;
    } catch (err: any) {
      const safeMsg = safeError(err);
      setError(safeMsg);
      Alert.alert("Erro", safeMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        user,
        preferenciasCompletas,
        signIn,
        signOut,
        updatePreferencesStatus,
        isLoading,
        error,
        login,
        register,
        loginWithGoogle,
        fetchUser: () => fetchUser(token || ""),
        API_BASE_URL: API_BASE_URL || "",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
};

export default AuthContext;
