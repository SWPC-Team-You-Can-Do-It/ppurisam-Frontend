// src/components/login/PrivateRoute.js
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const PrivateRoute = ({ children }) => {
  const { auth, loading } = useContext(AuthContext);

  if (loading) {
    return <div>로딩 중...</div>; // 로딩 스피너 등으로 대체 가능
  }

  return auth.isAuthenticated ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
