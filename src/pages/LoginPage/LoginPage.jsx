// MainPage.jsx
import React from "react";
import "@/pages//LoginPage/LoginPage.css";
import Login from "@/components/login/Login";

const LoginPage = () => {
  return (
    <div className="login-container">
      <div className="login-content">
        <Login />
      </div>
    </div>
  );
};

export default LoginPage;
