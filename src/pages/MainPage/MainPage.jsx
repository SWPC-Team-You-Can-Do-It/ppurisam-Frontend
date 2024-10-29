// MainPage.jsx
import React from "react";
import Header from "@/components/main/Header/Header";
import Slider from "@/components/main/Slider/Slider";
import Footer from "@/components/main/Footer/Footer";
import "@/pages/MainPage/MainPage.css";

const MainPage = () => {
  return (
    <div className="main-container">
      <Header />
      <div className="content">
        <Slider />
      </div>
      <Footer />
    </div>
  );
};

export default MainPage;
