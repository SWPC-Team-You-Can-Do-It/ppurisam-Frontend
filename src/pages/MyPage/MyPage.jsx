// Frontend/src/pages/MyPage/MyPage.jsx
import React from "react";
import Header from "@/components/main/Header/Header";
import Footer from "@/components/main/Footer/Footer";
import "@/pages/MyPage/MyPage.css";
import My from "@/components/my/My";

const MyPage = () => {
    return (
        <div className="mypage-container">
            <Header />
            <div className="mypage-content">
                <My />
            </div>
            <Footer />
        </div>
    );
};

export default MyPage;
