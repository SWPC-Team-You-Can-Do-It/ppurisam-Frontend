// src/components/chatbot/Chatbot.jsx

import React, { useState } from 'react';
import './Chatbot.css';
import Robot from './Robot'; // 로봇 컴포넌트 임포트

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="chatbot-container">
        {/* 로봇 왼쪽에 텍스트 추가 */}
        {/* 로봇 SVG 컴포넌트 */}
        <Robot onClick={toggleChatbot} />
      </div>
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        {/* 여기에서 챗봇 내용을 구현 */}
        <p>챗봇 내용이 여기에 표시됩니다.</p>
        <button onClick={toggleChatbot}>닫기</button>
      </div>
    </>
  );
};

export default Chatbot;
