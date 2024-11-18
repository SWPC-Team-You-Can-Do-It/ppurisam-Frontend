// Frontend/src/components/chatbot/EasySmsButton/EasySmsButton.jsx

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import './EasySmsButton.css';
import axiosInstance from '../../login/axiosInstance'; // Axios 인스턴스 import

const EasySmsButton = forwardRef(({ addBotMessage, setChatState }, ref) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [smsError, setSmsError] = useState('');

  // EasySmsButton에서 사용할 함수 정의
  const startEasySms = () => {
    addBotMessage('보낼 문자내용이나 키워드를 입력해주세요');
    setChatState('awaitingSmsInput');
  };

  // 문자 전송 함수
  const processSms = async (smsContent) => {
    if (smsContent.trim() === '') {
      addBotMessage('문자 내용을 입력해주세요.');
      setSmsError('문자 내용을 입력해주세요.');
      setChatState('idle');
      return;
    }

    try {
      setIsProcessing(true);
      setSmsError('');

      // 백엔드의 TextAI API 호출
      const response = await axiosInstance.post('/api/text-ai', { text: smsContent });

      console.log('TextAI API 응답 데이터:', response.data); // 응답 데이터 로그 추가

      if (response.data && response.data.generated_text) { // generated_text로 수정
        const generatedText = response.data.generated_text; // generated_text로 수정
        addBotMessage(generatedText);
        setChatState('idle'); // 상태를 'idle'로 되돌림
      } else {
        setSmsError('AI가 문자를 생성하는 데 실패했습니다.');
        addBotMessage('AI가 문자를 생성하는 데 실패했습니다.');
        setChatState('idle');
      }
    } catch (error) {
      console.error('문자 전송 오류:', error);
      setSmsError('문자 전송 중 오류가 발생했습니다.');
      addBotMessage('문자 전송 중 오류가 발생했습니다.');
      setChatState('idle');
    } finally {
      setIsProcessing(false);
    }
  };

  // useImperativeHandle을 사용하여 부모에게 함수 노출
  useImperativeHandle(ref, () => ({
    startEasySms,
    processSms
  }));

  return (
    <button className="easy-sms-button" onClick={startEasySms} disabled={isProcessing}>
      간편 문자 전송
    </button>
  );
});

export default EasySmsButton;
