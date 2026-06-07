import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // On initial load or refresh, ask the backend "Who am I?"
  // The browser automatically sends the HttpOnly cookie in the header.
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          credentials: "include", // CRITICAL: Sends cookies to the server
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user); // Backend returns { email, role, name }
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = (userData) => {
    // We don't save the token here anymore; the browser saved it
    // into the cookie when the login response was received.
    setUser(userData);
    
    if (userData.role === "admin") navigate("/admin/dashboard");
    else if (userData.role === "alumni") navigate("/alumni/dashboard");
    else navigate("/student/dashboard");
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      navigate("/login");
    }
  };

  const clearAuthState = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, clearAuthState, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
