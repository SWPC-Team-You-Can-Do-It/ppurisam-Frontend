// Frontend/src/components/chatbot/EasySmsButton/EasySmsButton.jsx

import React, { forwardRef, useImperativeHandle } from 'react';
import './EasySmsButton.css';

const EasySmsButton = forwardRef(({ addBotMessage, setChatState }, ref) => {
  // EasySmsButton에서 사용할 함수 정의
  const startEasySms = () => {
    addBotMessage('보낼 문자내용이나 키워드를 입력해주세요');
    setChatState('awaitingSmsInput');
  };

  // useImperativeHandle을 사용하여 부모에게 함수 노출
  useImperativeHandle(ref, () => ({
    startEasySms
  }));

  // 버튼 클릭 시 함수 호출
  const handleClick = () => {
    startEasySms();
  };

  return (
    <button className="easy-sms-button" onClick={handleClick}>
      간편 문자 전송
    </button>
  );
});

export default EasySmsButton;
