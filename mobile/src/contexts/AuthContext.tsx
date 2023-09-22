import React, { useState, createContext, ReactNode, useEffect } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { api } from "../services/api";

type UserProps = {
  id: string;
  name: string;
  email: string;
  token: string
}

type AuthProviderProps = {
  children: ReactNode;
}

type AuthContextData = {
  user: UserProps;
  isAuthenticated: boolean;
  signIn: (crendentials: SignInProps) => Promise<void>;
  loadingAuth: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

type SignInProps = {
  email: string;
  password: string;
}

export const AuthContext = createContext({} as AuthContextData);
let timer: any;

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProps>({
    id: '',
    name: '',
    email: '',
    token: ''
  })

  const [loadingAuth, setLoadingAuth] = useState(false)
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user.name;

  useEffect(() => {

    async function getUser() {
      //Pegar os dados salvos do user
      const userInfo = await AsyncStorage.getItem('@sujeitopizzaria');
      let hasUser: UserProps = JSON.parse(userInfo || '{}')

      //Vrificar se recebemos as informações dele.
      if (Object.keys(hasUser).length > 0) {
        api.defaults.headers.common['Authorization'] = `Bearer ${hasUser.token}`

        setUser({
          id: hasUser.id,
          name: hasUser.name,
          email: hasUser.email,
          token: hasUser.token
        })
      }

      setLoading(false);



    }

    getUser();
  }, [])

  useEffect(() => {
    clearInterval(timer);

    timer = setInterval(() => {
      (async () => {
        if (!!user.token) {
          const userInfo = await AsyncStorage.getItem('@sujeitopizzaria');
          if (!userInfo) {
            signOut()
          }
        }
      })();
    }, 1000); // 1 segundo

    return () => {
      clearInterval(timer);
    }
  }, [user.token]);

  async function signIn({ email, password }: SignInProps) {
    setLoadingAuth(true);

    try {
      const response = await api.post('/session', {
        email,
        password
      })

      const { id, name, token } = response.data;

      const data = {
        ...response.data
      };

      await AsyncStorage.setItem('@sujeitopizzaria', JSON.stringify(data))

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      setUser({
        id,
        name,
        email,
        token,
      })

      setLoadingAuth(false);

    } catch (err) {
      console.log('erro ao acessar', err)
      setLoadingAuth(false);
    }
  }

  async function signOut() {
    await AsyncStorage.clear()
      .then(() => {
        setUser({
          id: '',
          name: '',
          email: '',
          token: ''
        })
      })
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signIn, loading, loadingAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}