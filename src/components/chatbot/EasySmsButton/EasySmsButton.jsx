// Frontend/src/components/chatbot/EasySmsButton/EasySmsButton.jsx

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import './EasySmsButton.css';
import axiosInstance from '../../login/axiosInstance'; // Axios 인스턴스 import
import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';

const EasySmsButton = forwardRef(({ addBotMessage, setChatState }, ref) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [smsError, setSmsError] = useState('');
  const [success, setSuccess] = useState('');
  const senderNumber = '01067064512'; // 발신번호 기본값

  // AI 생성된 텍스트 저장
  const [aiText, setAiText] = useState('');
  const [refKey] = useState(uuidv4().replace(/-/g, '').substring(0, 32));

  // 이미지 데이터 관리 (local state)
  const [imagePayload, setImagePayload] = useState(null);

  // 메시지 제목 저장
  const [subject, setSubject] = useState('');

  // useImperativeHandle을 사용하여 부모에게 함수 노출
  useImperativeHandle(ref, () => ({
    startEasySms,
    processSubject, // 메시지 제목 처리 함수 노출
    processSms, // 문자 내용 처리 함수 노출
    processPhoneNumber, // 전화번호 처리 함수 노출
  }));

  // 간편 문자 전송 버튼 클릭 시 호출
  const startEasySms = () => {
    console.log('startEasySms 호출됨');
    addBotMessage('보낼 메시지의 제목을 설정해주세요');
    setChatState('awaitingSubjectInput');
  };

  // 메시지 제목 처리 함수
  const processSubject = async (subjectInput) => {
    console.log('processSubject 호출됨:', subjectInput);

    if (subjectInput.trim() === '') {
      addBotMessage('메시지 제목을 입력해주세요.');
      setSmsError('메시지 제목을 입력해주세요.');
      setChatState('awaitingSubjectInput'); // 다시 메시지 제목 입력 대기 상태로
      return;
    }

    setSubject(subjectInput);
    console.log('메시지 제목 저장됨:', subjectInput);

    // 메시지 내용 입력 요청
    addBotMessage('보낼 문자내용이나 키워드를 입력해주세요');
    setChatState('awaitingSmsInput');
  };

  // 문자 전송 및 이미지 생성 함수
  const processSms = async (smsContent) => {
    console.log('processSms 호출됨:', smsContent);

    if (smsContent.trim() === '') {
      addBotMessage('문자 내용을 입력해주세요.');
      setSmsError('문자 내용을 입력해주세요.');
      setChatState('idle');
      return;
    }

    try {
      setIsProcessing(true);
      setSmsError('');
      setSuccess('');

      // AI 텍스트 생성 엔드포인트 호출 (/api/text-ai) with text and theme
      const textResponse = await axiosInstance.post('/api/text-ai', {
        text: smsContent,
        theme: '기본', // 기본 테마
      });

      console.log('TextAI API 응답 데이터:', textResponse.data); // 응답 데이터 로그 추가

      // 'generated_text' 필드로 접근
      if (textResponse.data && textResponse.data.generated_text) {
        const generatedText = textResponse.data.generated_text;
        setAiText(generatedText);
        addBotMessage(generatedText);
        setChatState('idle'); // 상태를 'idle'로 되돌림

        // 이미지 생성 중 메시지 추가
        addBotMessage('이미지 생성 중 …', 'loading-message');

        try {
          // 이미지 생성 엔드포인트 호출 (/api/image-ai) with prompt and theme
          const imageAIRequest = {
            prompt: generatedText,
            theme: '빈티지/레트로', // 기본 이미지 테마
          };
          const imageResponse = await axiosInstance.post('/api/image-ai', imageAIRequest, {
            responseType: 'text', // 응답을 텍스트로 처리
          });

          console.log('ImageAI API 응답 데이터:', imageResponse.data); // 이미지 응답 데이터 로그 추가

          // imageResponse.data가 문자열 URL인지 확인
          let imageUrl = '';
          if (typeof imageResponse.data === 'string') {
            imageUrl = imageResponse.data.trim(); // 문자열 URL
          } else {
            throw new Error('이미지 URL 형식이 올바르지 않습니다.');
          }

          if (imageUrl) {
            // 이미지 저장 및 로드
            // 1. 다운로드 및 저장
            const downloadResponse = await axiosInstance.post(
              '/api/image/download-and-save',
              null, // No body
              {
                params: { url: imageUrl },
              }
            );

            const savedFileName = downloadResponse.data; // 파일 이름
            console.log('이미지 저장 파일명:', savedFileName);

            // 2. 로드하여 base64 데이터 가져오기
            const loadResponse = await axiosInstance.get('/api/image/load-image', {
              params: { fileName: savedFileName },
            });

            const base64Image = loadResponse.data; // base64 문자열
            console.log('로드된 base64 이미지 데이터:', base64Image);

            // 3. base64 URL 형식으로 변환
            const base64ImageUrl = `data:image/png;base64,${base64Image}`;

            // 4. 이미지 데이터 저장 (SendRequest에 사용할 데이터)
            const newImagePayload = {
              fileName: savedFileName,
              base64Data: base64Image,
              size: base64Image.length, // 크기는 필요에 따라 조정
              url: imageUrl,
            };
            setImagePayload(newImagePayload);

            // 이미지 메시지 수정: base64ImageUrl 사용
            addBotMessage(base64ImageUrl, 'image-message');

            // 전화번호 입력 요청
            addBotMessage('이 문자 메시지를 보낼 대상의 전화번호를 적어주세요');
            setChatState('awaitingPhoneNumber');
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
        // 에러 메시지를 문자열로 변환하여 표시
        setSmsError(`문자 전송 중 오류가 발생했습니다: ${JSON.stringify(error.response.data)}`);
        addBotMessage(`문자 전송 중 오류가 발생했습니다: ${JSON.stringify(error.response.data)}`);
      } else {
        setSmsError('문자 전송 중 오류가 발생했습니다.');
        addBotMessage('문자 전송 중 오류가 발생했습니다.');
      }
      setChatState('idle');
    } finally {
      setIsProcessing(false); // 로딩 상태 해제
    }
  };

  // 전화번호 처리 함수
  const processPhoneNumber = async (phoneNumber) => {
    console.log('processPhoneNumber 호출됨:', phoneNumber);

    // 전화번호 형식 검증: '01012345678'
    const phoneRegex = /^010\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      addBotMessage('전화번호 형식이 올바르지 않습니다. 하이픈 없이 11자리 숫자(예: 01012345678)를 입력해주세요.');
      setSmsError('전화번호 형식이 올바르지 않습니다. 하이픈 없이 11자리 숫자(예: 01012345678)를 입력해주세요.');
      setChatState('awaitingPhoneNumber'); // 다시 전화번호 입력 대기 상태로
      return;
    }

    console.log('전화번호 형식 검증 완료:', phoneNumber);

    // 메시지 전송 로직
    if (!aiText || !imagePayload || !subject) {
      setSmsError('메시지 데이터가 준비되지 않았습니다.');
      addBotMessage('메시지 데이터가 준비되지 않았습니다.');
      setChatState('idle');
      return;
    }

    try {
      setIsProcessing(true);
      setSmsError('');
      setSuccess('');

      // SendRequest 객체 생성
      const sendRequest = {
        account: import.meta.env.VITE_REACT_APP_PPURIO_ACCOUNT, // .env 파일에서 계정 정보 가져오기
        messageType: imagePayload ? 'MMS' : 'SMS',
        content: aiText,
        from: senderNumber,
        duplicateFlag: 'Y',
        targetCount: 1, // 필요에 따라 다수 수신자 지원
        targets: [
          {
            to: phoneNumber,
            name: 'Recipient', // 이름은 필요에 따라 조정
            changeWord: {}, // 필요에 따라 조정
          },
        ],
        refKey: refKey, // 이미 생성된 refKey 사용
        rejectType: 'AD',
        sendTime: '',
        subject: subject, // 사용자 입력 제목 사용
        files: imagePayload
          ? [
              {
                name: imagePayload.fileName,
                data: imagePayload.base64Data,
                size: imagePayload.size,
                url: imagePayload.url,
              },
            ]
          : undefined,
      };

      console.log('Final SendRequest to send:', sendRequest);

      // 메시지 전송 엔드포인트 호출 (/api/ppurio/send)
      const response = await axiosInstance.post('/api/ppurio/send', sendRequest, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('SendMessage API 응답 데이터:', response.data);

      setSuccess('메시지가 성공적으로 전송되었습니다.');
      setSmsError('');
      addBotMessage('메시지가 성공적으로 전송되었습니다.');
      setChatState('idle'); // 상태를 'idle'로 되돌림
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      if (error.response && error.response.data) {
        setSmsError(`문자 전송 중 오류가 발생했습니다: ${JSON.stringify(error.response.data)}`);
        addBotMessage(`문자 전송 중 오류가 발생했습니다: ${JSON.stringify(error.response.data)}`);
      } else {
        setSmsError('문자 전송 중 오류가 발생했습니다.');
        addBotMessage('문자 전송 중 오류가 발생했습니다.');
      }
      setChatState('idle');
    } finally {
      setIsProcessing(false); // 로딩 상태 해제
    }
  };

  return (
    <button className="easy-sms-button" onClick={startEasySms} disabled={isProcessing}>
      간편 문자 전송
    </button>
  );
});

// PropTypes 정의
EasySmsButton.propTypes = {
  addBotMessage: PropTypes.func.isRequired,
  setChatState: PropTypes.func.isRequired,
};

export default EasySmsButton;