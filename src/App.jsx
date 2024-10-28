import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import SendPage from "./pages/SendPage/SendPage";
import TrackingPage from "./pages//TrackingPage/TrackingPage";
import ContactPage from './pages/ContactPage/ContactPage';
import Footer from "@/components/main/Footer/Footer"; // Footer 임포트
import "./App.css"; // 스타일시트 임포트

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/send" element={<SendPage />} />
        <Route path="/tracking" element={<TrackingPage />}/>
          <Route path="/contact" element={<ContactPage />} />
        {/* 필요한 다른 라우트 추가 */}
      </Routes>
    </Router>
  );
}

export default App;
