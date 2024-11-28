// Frontend/src/components/chatbot/ServiceDescriptionButton/ServiceDescriptionButton.jsx

import React, { forwardRef, useImperativeHandle } from 'react';
import './ServiceDescriptionButton.css';

const ServiceDescriptionButton = forwardRef(({ addBotMessage }, ref) => {
  // ServiceDescriptionButton에서 사용할 함수 정의
  const showServiceDescription = () => {
    addBotMessage('[PPURISAM]은 한성대학교와 다우기술이 연계하여 개발된 프로젝트로, 누구나 쉽게 이용할 수 있는 문자 전송 서비스를 제공합니다. 사용자 편의성을 극대화하기 위해 음성인식, AI 기반 이미지 생성, 챗봇 등의 기능을 도입하였습니다.');
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