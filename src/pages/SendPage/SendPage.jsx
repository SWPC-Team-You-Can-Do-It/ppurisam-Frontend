//SendPage.jsx
import React from "react";
import Header from "@/components/main/Header/Header";
import Footer from "@/components/main/Footer/Footer";
import "@/pages/SendPage/SendPage.css";
import ImageSend from "@/components/send/ImageSend/ImageSend";
import MessageSend from "@/components/send/MessageSend/MessageSend";

const SendPage = () => {
    return (
        <div className="send-container">
            <Header />
            <div className="send-content-wrapper">
                <div className="send-content">
                    <MessageSend />
                    <ImageSend />
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default SendPage;
