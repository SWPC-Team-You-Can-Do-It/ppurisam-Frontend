// MainPage.jsx
import React from "react";
import Header from "@/components/main/Header/Header";
import Footer from "@/components/main/Footer/Footer";
import Tracking from "@/components/tracking/Tracking";
import "@/pages/MainPage.css";
const TrackingPage = () => {
  return (
    <div className="tracking-container">
      <Header />
      <div className="tracking-content">
        <Tracking />
      </div>
      <Footer />
    </div>
  );
};

export default TrackingPage;
