// src/index.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // App 컴포넌트 임포트
import { AuthProvider } from "./components/login/AuthContext";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
