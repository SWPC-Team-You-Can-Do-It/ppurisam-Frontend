// Frontend/src/components/chatbot/ServiceDescriptionButton/ServiceDescriptionButton.jsx

import React, { forwardRef, useImperativeHandle } from 'react';
import './ServiceDescriptionButton.css';

const ServiceDescriptionButton = forwardRef(({ addBotMessage }, ref) => {
  // ServiceDescriptionButton에서 사용할 함수 정의
  const showServiceDescription = () => {
    addBotMessage('대충 뿌리오 서비스 설명');
  };

  // useImperativeHandle을 사용하여 부모에게 함수 노출
  useImperativeHandle(ref, () => ({
    showServiceDescription
  }));

  // 버튼 클릭 시 함수 호출
  const handleClick = () => {
    showServiceDescription();
  };

  return (
    <button className="service-description-button chatbot-action-button" onClick={handleClick}>
      서비스 설명
    </button>
  );
});

export default ServiceDescriptionButton;