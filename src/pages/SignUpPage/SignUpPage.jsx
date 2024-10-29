// MainPage.jsx
import React from "react";
import SignUp from "@/components/signup/SignUp";
import "@/pages/SignUpPage/SignUpPage.css";

const SignUpPage = () => {
  return (
    <div className="signup-container">
      <div className="signup-content">
        <SignUp />
      </div>
    </div>
  );
};

export default SignUpPage;
