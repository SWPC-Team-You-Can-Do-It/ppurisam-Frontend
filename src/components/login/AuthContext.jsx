// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    access_token: localStorage.getItem("token"),
    ppurio_token: localStorage.getItem("ppurio_token"),
    isAuthenticated: !!localStorage.getItem("token"),
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const ppurioToken = localStorage.getItem("ppurio_token");
    if (token) {
      setAuth({
        access_token: token,
        ppurio_token: ppurioToken,
        isAuthenticated: true,
      });
    } else {
      setAuth({
        access_token: null,
        ppurio_token: null,
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
