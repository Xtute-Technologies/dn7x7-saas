"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as authService from '@/services/authService';
import Cookies from 'js-cookie';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const accessToken = Cookies.get('access_token');
      if (accessToken) {
        try {
          const response = await authService.fetchUser();
          setUser(response.data);
        } catch (error) {
          setUser(null);
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    Cookies.set('access_token', response.data.access, { secure: true, sameSite: 'strict' });
    Cookies.set('refresh_token', response.data.refresh, { secure: true, sameSite: 'strict' });
    const userResponse = await authService.fetchUser();
    setUser(userResponse.data);
    router.push('/dashboard');
  };

  const signup = async (userData) => {
    await authService.signup(userData);
    await login({ email: userData.email, password: userData.password });
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
