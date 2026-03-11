import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedin = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data.data);
        }
      } catch (err) {
        localStorage.removeItem("token");
      }
      setLoading(false);
    };
    checkLoggedin();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/login`, { email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  const register = async (name, email, password) => {
    const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/register`, { name, email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
