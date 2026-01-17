import { createContext, useEffect, useState, useContext } from "react";
import authService from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      
      // ✅ SUCCESS: Only runs if handleResponse didn't throw
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data)); // Assuming backend returns user object inside data
        setUser(data); 
      }
      return data;
    } catch (error) {
      // ❌ FAILURE: Clear everything just in case
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw error; // Pass error to Login.jsx to show "Invalid Password"
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await authService.register(name, email, password);
      
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
      }
      return data;
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);