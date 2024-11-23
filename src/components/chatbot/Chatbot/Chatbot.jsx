// Frontend/src/components/chatbot/Chatbot/Chatbot.jsx

import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import Robot from '../Robot/Robot';
import ChatbotMessage from './ChatbotMessage';
import ServiceDescriptionButton from '../ServiceDescriptionButton/ServiceDescriptionButton';
import EasySmsButton from '../EasySmsButton/EasySmsButton';
import AddContactButton from '../AddContactButton/AddContactButton';
import axiosInstance from '../../login/axiosInstance'; // Axios 인스턴스 경로 수정
import useAudioRecorder from '../../../utils/useAudioRecorder'; // 음성 녹음 훅 import
import micIcon from '../../../assets/images/send/mic.png'; // 마이크 이미지 import

// Web Speech API 지원 여부 확인 및 객체 생성
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [chatState, setChatState] = useState('idle'); // 'idle', 'awaitingContactInput', 'awaitingGroupSelection', 'awaitingSmsInput', 'awaitingSubjectInput', 'awaitingPhoneNumber'
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const [error, setError] = useState(''); // 오류 상태 추가

  const messagesEndRef = useRef(null); // 스크롤바 제어를 위한 ref
  const addContactRef = useRef(); // AddContactButton 컴포넌트에 접근하기 위한 ref
  const serviceDescriptionRef = useRef(); // ServiceDescriptionButton 컴포넌트에 접근하기 위한 ref
  const easySmsRef = useRef(); // EasySmsButton 컴포넌트에 접근하기 위한 ref

  // 음성 인식 객체 및 상태
  const recognition = useRef(null);

  // 초기 메시지 상태
  const [initialMessage, setInitialMessage] = useState('');

  // 음성 인식 설정 및 시작
  useEffect(() => {
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.lang = 'ko-KR'; // 한국어 설정
      recognition.current.continuous = true; // 지속적으로 인식
      recognition.current.interimResults = false; // 중간 결과 필요 없음

      recognition.current.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        console.log('인식된 텍스트:', transcript);

        // 키워드 "뿌리야"가 포함되어 있는지 확인
        if (transcript.includes('뿌리야')) {
          toggleChatbotByVoice();
        }
      };

      recognition.current.onerror = (event) => {
        console.error('음성 인식 오류:', event.error);
      };

      recognition.current.start();
      console.log('음성 인식 시작');
    } else {
      console.warn('이 브라우저는 Web Speech API를 지원하지 않습니다.');
    }

    // 컴포넌트 언마운트 시 음성 인식 중지
    return () => {
      if (recognition.current) {
        recognition.current.stop();
        console.log('음성 인식 중지');
      }
    };
  }, []);

  // 음성으로 챗봇 열기/닫기
  const toggleChatbotByVoice = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
    if (!isOpen) {
      // 챗봇 창이 열릴 때 초기 메시지와 상태 설정
      setMessages([]);
      setInitialMessage('안녕하세요 뿌리삼 서비스입니다. 원하시는 메뉴를 선택해주세요');
      setChatState('idle');
    }
  };

  // 챗봇 창 닫기/열기 토글 함수
  const toggleChatbot = (e) => {
    e.stopPropagation(); // 이벤트 전파 방지
    setIsOpen(!isOpen);
    if (!isOpen) {
      // 챗봇 창이 열릴 때 초기 메시지와 버튼 표시
      setMessages([]);
      setInitialMessage('안녕하세요 뿌리삼 서비스입니다. 원하시는 메뉴를 선택해주세요');
      setChatState('idle');
    }
  };

  // 메시지 추가 함수
  const addBotMessage = (text, className = '') => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: text, isUser: false, className: className },
    ]);
  };

  // 사용자 메시지 추가 함수
  const addUserMessage = (text) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: text, isUser: true },
    ]);
  };

  // 메시지 전송 핸들러
  const handleSend = async () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue === '') return;

    if (isLoading) return; // 이미 처리 중이면 함수 종료

    setIsLoading(true); // 처리 시작 시 로딩 상태 설정

    try {
      console.log('handleSend 호출됨, 현재 chatState:', chatState);
      if (chatState === 'awaitingSubjectInput') {
        // 메시지 제목 입력 대기 상태일 때
        addUserMessage(trimmedValue);

        // EasySmsButton의 processSubject 함수 호출
        if (easySmsRef.current && easySmsRef.current.processSubject) {
          await easySmsRef.current.processSubject(trimmedValue);
          setInputValue('');
        } else {
          console.error('processSubject 함수가 EasySmsButton에서 호출되지 않음');
        }
      } else if (chatState === 'awaitingSmsInput') {
        // 간편 문자 전송 상태일 때
        addUserMessage(trimmedValue);

        // EasySmsButton의 processSms 함수 호출하여 AI 처리
        if (easySmsRef.current && easySmsRef.current.processSms) {
          await easySmsRef.current.processSms(trimmedValue);
          setInputValue('');
        } else {
          console.error('processSms 함수가 EasySmsButton에서 호출되지 않음');
        }
      } else if (chatState === 'awaitingPhoneNumber') {
        // 전화번호 입력 대기 상태일 때
        addUserMessage(trimmedValue);

        // EasySmsButton의 processPhoneNumber 함수 호출
        if (easySmsRef.current && easySmsRef.current.processPhoneNumber) {
          await easySmsRef.current.processPhoneNumber(trimmedValue);
          setInputValue('');
        } else {
          console.error('processPhoneNumber 함수가 EasySmsButton에서 호출되지 않음');
        }
      } else {
        // 기타 상태 처리
        // 사용자 메시지 추가
        addUserMessage(trimmedValue);
        setInputValue('');

        // 현재 챗봇 상태에 따라 처리
        if (chatState === 'idle') {
          // 서비스 설명
          if (trimmedValue === '서비스 설명') {
            // ServiceDescriptionButton의 기능 호출
            if (serviceDescriptionRef.current) {
              serviceDescriptionRef.current.showServiceDescription();
            }
          }
          // 간편 문자 전송
          else if (trimmedValue === '간편 문자 전송') {
            // EasySmsButton의 기능 호출
            if (easySmsRef.current) {
              easySmsRef.current.startEasySms();
            }
          }
          // 연락처 추가
          else if (trimmedValue === '연락처 추가') {
            handleAddContact();
          }
          // 기타 메시지에 대한 기본 응답 (선택 사항)
          else {
            handleDefaultResponse(trimmedValue);
          }
        } else if (chatState === 'awaitingContactInput' || chatState === 'awaitingGroupSelection') {
          // AddContactButton 컴포넌트에 사용자 입력 전달
          if (addContactRef.current) {
            addContactRef.current.handleUserInput(trimmedValue);
          }
        }
        // 'awaitingSmsInput', 'awaitingSubjectInput', 'awaitingPhoneNumber' 상태는 이미 위에서 처리되므로 별도 처리 불필요
      }
    } catch (err) {
      console.error(err);
      setError('메시지 전송 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false); // 처리 완료 시 로딩 상태 해제
    }
  };

  // 사용자 입력 변경 핸들러
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // 메시지 전송 핸들러를 엔터 키에 연결
  const handleKeyUp = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 기본 동작 방지
      handleSend();
    }
  };

  // handleAudioAvailable 함수 정의
  const handleAudioAvailable = async (file) => {
    if (!file) {
      setError('녹음된 파일이 없습니다.');
      return;
    }

    console.log('녹음된 Blob:', file);

    const formData = new FormData();
    formData.append('file', file, file.name);

    try {
      setIsLoading(true);
      setError('');

      const response = await axiosInstance.post('/api/stt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('STT API 응답 데이터:', response.data);

      const transcription = response.data.text;
      if (transcription) {
        console.log('인식된 텍스트:', transcription);
        // 사용자 메시지에 직접 추가하지 않고 입력창에만 설정
        setInputValue(transcription);
      } else {
        setError('음성 인식에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error('음성 인식 오류:', err);
      if (err.response) {
        console.error('STT API 응답 오류:', err.response.statusText);
        setError('서버 오류로 인해 음성 인식에 실패했습니다.');
      } else {
        setError('음성 인식 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // useAudioRecorder 훅 호출 (handleAudioAvailable 함수 전달)
  const { isRecording, startRecording, stopRecording } = useAudioRecorder(handleAudioAvailable); // 음성 녹음 훅 사용

  // 기본 응답 처리 (선택 사항)
  const handleDefaultResponse = (userMessage) => {
    addBotMessage(`죄송합니다. "${userMessage}"에 대한 응답을 준비 중입니다.`);
  };

  // 연락처 추가 처리 함수
  const handleAddContact = () => {
    // AddContactButton 컴포넌트에 연락처 추가 프로세스 시작을 알림
    if (addContactRef.current) {
      addContactRef.current.startAddContact();
    }
    setChatState('awaitingContactInput');
  };

  // 메시지가 업데이트될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 마이크 버튼 클릭 핸들러
  const handleMicClick = async () => {
    if (isRecording) {
      try {
        const file = await stopRecording(); // 녹음 중지
        await handleAudioAvailable(file); // 녹음된 파일 처리
      } catch (err) {
        console.error('녹음 중지 오류:', err);
        setError('녹음을 처리하는 중 오류가 발생했습니다.');
      }
    } else {
      startRecording();
    }
  };

  return (
    <>
      <div className="chatbot-container">
        {/* 로봇 SVG 컴포넌트 */}
        <Robot onClick={toggleChatbot} />
      </div>
      {isOpen && (
        <div className="chatbot-window">
          {/* 챗봇 창 닫기 버튼 */}
          <button className="chatbot-close-button" onClick={toggleChatbot}>
            닫기
          </button>
          {/* 챗봇 메시지 */}
          <div className="chatbot-messages">
            {/* 초기 챗봇 메시지 */}
            {initialMessage && (
              <ChatbotMessage
                message={initialMessage}
                isUser={false}
              />
            )}
            {/* 버튼들 */}
            <div className="chatbot-buttons">
              <ServiceDescriptionButton
                ref={serviceDescriptionRef}
                addBotMessage={addBotMessage}
              />
              <EasySmsButton
                ref={easySmsRef}
                addBotMessage={addBotMessage}
                setChatState={setChatState}
              />
              <AddContactButton
                ref={addContactRef}
                addBotMessage={addBotMessage}
                setChatState={setChatState}
              />
            </div>
            {/* 사용자 및 챗봇 메시지 */}
            {messages.map((message, index) => (
              <ChatbotMessage
                key={index}
                message={message.text}
                isUser={message.isUser}
                className={message.className}
              />
            ))}
            {/* 스크롤을 위한 더미 요소 */}
            <div ref={messagesEndRef} />
          </div>
          {/* 입력창 */}
          <div className="chatbot-input-area">
            <input
              type="text"
              className="chatbot-input"
              value={inputValue}
              onChange={handleInputChange}
              onKeyUp={handleKeyUp} // onKeyUp으로 변경
              placeholder="메시지를 입력하세요"
            />
            {/* 음성 녹음 버튼 수정 */}
            <button
              className={`chatbot-mic-button ${isRecording ? 'recording' : ''}`}
              onClick={handleMicClick}
              aria-label="음성 녹음"
              disabled={isLoading}
            >
              {isRecording ? '녹음 종료' : <img src={micIcon} alt="Mic" />}
            </button>
            <button
              className="chatbot-send-button"
              onClick={handleSend}
              disabled={isLoading}
            >
              전송
            </button>
          </div>
          {/* 오류 메시지 표시 */}
          {error && <div className="error-message">{error}</div>}
        </div>
      )}
    </>
  );
};

export default Chatbot;