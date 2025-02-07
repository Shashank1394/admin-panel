// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Retrieve token from localStorage if it exists.
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // When token changes, update axios default header and optionally decode user info.
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log("Token set in axios headers:", token);
      // Optionally, decode the token or fetch user details from the backend.
      setUser({ username: 'admin' }); // Example – replace as needed.
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      console.log("No token found. Axios Authorization header removed.");
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/login', { username, password });
      const receivedToken = response.data.token;
      console.log("Login successful. Received token:", receivedToken);
      localStorage.setItem('authToken', receivedToken);
      setToken(receivedToken);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error.response?.data?.message || error.message);
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    console.log("User logged out. Token removed.");
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
