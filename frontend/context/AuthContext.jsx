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
    
    // Secure cookies based on environment (https check is good practice)
    const isSecure = window.location.protocol === 'https:';
    
    Cookies.set('access_token', response.data.access, { secure: isSecure, sameSite: 'strict' });
    Cookies.set('refresh_token', response.data.refresh, { secure: isSecure, sameSite: 'strict' });
    
    const userResponse = await authService.fetchUser();
    setUser(userResponse.data);
    router.push('/dashboard');
  };

  const signup = async (userData) => {
    // Call the API to create the user
    await authService.signup(userData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
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