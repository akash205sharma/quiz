import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Configure axios defaults
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        // Verify token with backend
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/auth/verify`);
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch (err) {
        // Token invalid or expired
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, { email, password });
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const signup = async (name, email, password, role, year, branch) => {
    const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/auth/signup`, { name, email, password, role, year, branch });
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const logout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/logout`);
    } catch (err) {
      // Continue with logout even if request fails
    }
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
