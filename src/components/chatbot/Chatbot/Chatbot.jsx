// Frontend/src/components/chatbot/Chatbot/Chatbot.jsx

import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import Robot from '../Robot/Robot';
import ChatbotMessage from './ChatbotMessage';
import ServiceDescriptionButton from '../ServiceDescriptionButton/ServiceDescriptionButton';
import EasySmsButton from '../EasySmsButton/EasySmsButton';
import AddContactButton from '../AddContactButton/AddContactButton';

// 추가된 부분: Web Speech API 지원 여부 확인 및 객체 생성
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [chatState, setChatState] = useState('idle'); // 'idle', 'awaitingContactInput', 'awaitingGroupSelection', 'awaitingSmsInput'

  const messagesEndRef = useRef(null); // 스크롤바 제어를 위한 ref
  const addContactRef = useRef(); // AddContactButton 컴포넌트에 접근하기 위한 ref
  const serviceDescriptionRef = useRef(); // ServiceDescriptionButton 컴포넌트에 접근하기 위한 ref
  const easySmsRef = useRef(); // EasySmsButton 컴포넌트에 접근하기 위한 ref

  const [initialMessage, setInitialMessage] = useState('');

  // 추가된 부분: 음성 인식 객체 및 상태
  const recognition = useRef(null);

  // 추가된 부분: 음성 인식 설정 및 시작
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

  // 추가된 부분: 음성으로 챗봇 열기/닫기
  const toggleChatbotByVoice = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
    if (!isOpen) {
      // 챗봇 창이 열릴 때 초기 메시지와 상태 설정
      setMessages([]);
      setInitialMessage('안녕하세요 뿌리삼 서비스입니다. 원하시는 메뉴를 선택해주세요');
      setChatState('idle');
    }
  };

  // 기존 코드: 챗봇 창 닫기/열기 토글 함수
  const toggleChatbot = (e) => {
    e.stopPropagation(); // 이벤트 전파 방지
    setIsOpen((prevIsOpen) => !prevIsOpen);
    if (!isOpen) {
      // 챗봇 창이 열릴 때 초기 메시지와 상태 설정
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

  // 입력창 변경 핸들러
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // 메시지 전송 핸들러
  const handleSend = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue === '') return;

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
    }
    else if (chatState === 'awaitingContactInput' || chatState === 'awaitingGroupSelection') {
      // AddContactButton 컴포넌트에 사용자 입력 전달
      if (addContactRef.current) {
        addContactRef.current.handleUserInput(trimmedValue);
      }
    }
    else if (chatState === 'awaitingSmsInput') {
      // 사용자가 보낼 문자내용이나 키워드를 입력했을 때
      addBotMessage('AI를 이용하여 문자 메시지 출력 중…', 'loading');
      setChatState('idle');
      // 실제 문자 전송 로직을 여기에 추가할 수 있습니다.
      // 예: API 호출 등을 통해 문자 전송
    }
  };

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

  // 엔터 키로 메시지 전송
  const handleKeyUp = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 기본 동작 방지
      handleSend();
    }
  };

  // 메시지가 업데이트될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
                <button className="chatbot-send-button" onClick={handleSend}>
                  전송
                </button>
              </div>
            </div>
        )}
      </>
  );
};

export default Chatbot;
