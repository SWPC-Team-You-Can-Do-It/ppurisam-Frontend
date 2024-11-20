// Frontend/src/components/chatbot/EasySmsButton/EasySmsButton.jsx

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import './EasySmsButton.css';
import axiosInstance from '../../login/axiosInstance'; // Axios 인스턴스 import

const EasySmsButton = forwardRef(({ addBotMessage, setChatState }, ref) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [smsError, setSmsError] = useState('');

  // 기본 테마 설정 (필요에 따라 변경 가능)
  const defaultTheme = '빈티지/레트로';

  // EasySmsButton에서 사용할 함수 정의
  const startEasySms = () => {
    addBotMessage('보낼 문자내용이나 키워드를 입력해주세요');
    setChatState('awaitingSmsInput');
  };

  // 문자 전송 및 이미지 생성 함수
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

      // 기존 AI 텍스트 생성 엔드포인트 사용 (/api/text-ai)
      const textResponse = await axiosInstance.post('/api/text-ai', { text: smsContent });

      console.log('TextAI API 응답 데이터:', textResponse.data); // 응답 데이터 로그 추가

      if (textResponse.data && textResponse.data.generated_text) {
        const generatedText = textResponse.data.generated_text;
        addBotMessage(generatedText);
        setChatState('idle'); // 상태를 'idle'로 되돌림

        // 이미지 생성 중 메시지 추가
        addBotMessage('이미지 생성 중 …', 'loading-message');

        try {
          // 기존 이미지 생성 엔드포인트 사용 (/api/image-ai) with prompt and theme
          const imageAIRequest = {
            prompt: generatedText,
            theme: defaultTheme,
          };
          const imageResponse = await axiosInstance.post('/api/image-ai', imageAIRequest);

          console.log('ImageAI API 응답 데이터:', imageResponse.data); // 이미지 응답 데이터 로그 추가

          // imageResponse.data가 문자열 URL인지 확인
          let imageUrl = '';

          if (typeof imageResponse.data === 'string') {
            imageUrl = imageResponse.data; // 문자열 URL
          } else if (imageResponse.data && imageResponse.data.url) {
            imageUrl = imageResponse.data.url; // 객체 내 url 필드
          } else {
            throw new Error('이미지 URL 형식이 올바르지 않습니다.');
          }

          if (imageUrl) {
            // 이미지 생성 완료 후, 이미지 메시지 추가
            addBotMessage(imageUrl, 'image-message');
          } else {
            // 이미지 생성 실패 시, 오류 메시지 표시
            setSmsError('이미지 생성에 실패했습니다.');
            addBotMessage('이미지 생성에 실패했습니다.');
          }
        } catch (imageError) {
          console.error('이미지 생성 오류:', imageError);
          setSmsError('이미지 생성 중 오류가 발생했습니다.');
          addBotMessage('이미지 생성 중 오류가 발생했습니다.');
        }
      } else {
        setSmsError('AI가 문자를 생성하는 데 실패했습니다.');
        addBotMessage('AI가 문자를 생성하는 데 실패했습니다.');
        setChatState('idle');
      }
    } catch (error) {
      console.error('문자 전송 오류:', error);
      if (error.response && error.response.data) {
        setSmsError(`문자 전송 중 오류가 발생했습니다: ${error.response.data}`);
        addBotMessage(`문자 전송 중 오류가 발생했습니다: ${error.response.data}`);
      } else {
        setSmsError('문자 전송 중 오류가 발생했습니다.');
        addBotMessage('문자 전송 중 오류가 발생했습니다.');
      }
      setChatState('idle');
    } finally {
      setIsProcessing(false); // 로딩 상태 해제
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
