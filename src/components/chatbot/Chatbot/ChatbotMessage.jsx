// Frontend/src/components/chatbot/Chatbot/ChatbotMessage.jsx

import React from 'react';
import RobotIcon from '../Robot/RobotIcon';
import './ChatbotMessage.css';

const ChatbotMessage = ({ message, isUser, className = '' }) => {
  return (
    <div className={`chatbot-message ${isUser ? 'user' : 'bot'} ${className}`}>
      {!isUser && <RobotIcon />}
      <div className={`message-content ${isUser ? 'user-message' : 'bot-message'}`}>
        {className === 'image-message' ? (
          <img src={message} alt="생성된 이미지" className="generated-image" />
        ) : (
          <p>{message}</p>
        )}
      </div>
    </div>
  );
};

export default ChatbotMessage;
