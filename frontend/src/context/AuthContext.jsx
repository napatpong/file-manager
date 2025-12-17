import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      // Verify token
      setUser(JSON.parse(localStorage.getItem('user')));
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        username,
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
