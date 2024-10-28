// MainPage.jsx
import React from "react";
import Header from "@/components/main/Header/Header";
import Footer from "@/components/main/Footer/Footer";
import "@/pages/SendPage/SendPage.css";
import ImageSend from "@/components/send/ImageSend/ImageSend";
import MessageSend from "@/components/send/MessageSend/MessageSend"; // 추가된 임포트

const SendPage = () => {
  return (
    <div className="send-container">
      <Header />
      <div className="send-content">
        <MessageSend />
        <ImageSend />
      </div>
      <Footer />
    </div>
  );
};

export default SendPage;
