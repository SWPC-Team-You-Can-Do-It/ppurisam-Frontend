// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    access_token: localStorage.getItem("token"),
    isAuthenticated: !!localStorage.getItem("token"),
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuth({
        access_token: token,
        isAuthenticated: true,
      });
    } else {
      setAuth({
        access_token: null,
        isAuthenticated: false,
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
