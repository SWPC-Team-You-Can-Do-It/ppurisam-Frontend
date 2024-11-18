// src/components/send/MessageSend/MessageSend.jsx

import React, { useState } from "react";
import "./MessageSend.css";
import micIcon from "@/assets/images/send/mic.png";
import MessageCreate from "../MessageCreate/MessageCreate";
import axiosInstance from "../../login/axiosInstance"; // 상대 경로 수정
import useAudioRecorder from "@/utils/useAudioRecorder"; // 커스텀 훅 임포트

const MessageSend = ({ onContentUpdate, messageTitle, messageContent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputText, setInputText] = useState(messageTitle || "");
  const [textareaText, setTextareaText] = useState(messageContent || "");
  const [error, setError] = useState("");

  // Handle audio recording
  const handleAudioAvailable = async (file, target) => {
    const formData = new FormData();
    formData.append("file", file, file.name);

    try {
      const response = await axiosInstance.post(`/api/stt`, formData);
      const transcription = response.data.text;

      if (target === "input") {
        setInputText(transcription);
        onContentUpdate(transcription, textareaText);
      } else if (target === "textarea") {
        setTextareaText(transcription);
        onContentUpdate(inputText, transcription);
      }
    } catch (err) {
      console.error("파일 전송 오류:", err);
      if (err.response) {
        setError(
            `서버 오류: ${err.response.data.message || "알 수 없는 오류"}`
        );
      } else if (err.request) {
        setError("서버에 응답이 없습니다. 네트워크 상태를 확인해주세요.");
      } else {
        setError(`오류 발생: ${err.message}`);
      }
    }
  };

  // 입력 필드용 녹음기
  const {
    isRecording: isRecordingInput,
    startRecording: startRecordingInput,
    stopRecording: stopRecordingInput,
  } = useAudioRecorder(async (file) => {
    await handleAudioAvailable(file, "input");
  });

  // 텍스트 영역용 녹음기
  const {
    isRecording: isRecordingTextarea,
    startRecording: startRecordingTextarea,
    stopRecording: stopRecordingTextarea,
  } = useAudioRecorder(async (file) => {
    await handleAudioAvailable(file, "textarea");
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Handle mic button click for input
  const handleMicInputClick = () => {
    if (isRecordingInput) {
      stopRecordingInput(); // 녹음 종료 (수동)
    } else {
      startRecordingInput();
    }
  };

  // Handle mic button click for textarea
  const handleMicTextareaClick = () => {
    if (isRecordingTextarea) {
      stopRecordingTextarea(); // 녹음 종료 (수동)
    } else {
      startRecordingTextarea();
    }
  };

  // Handle generated message from AI
  const handleGeneratedMessage = (message) => {
    setTextareaText(message); // 메시지 내용 설정
    onContentUpdate(inputText, message); // 부모 컴포넌트로 전달
    closeModal(); // 모달 닫기
  };

  // Handle text change in textarea
  const handleTextChange = (e) => {
    const text = e.target.value;
    setTextareaText(text);
    onContentUpdate(inputText, text);
  };

  // Handle text change in input
  const handleTitleChange = (e) => {
    const title = e.target.value;
    setInputText(title);
    onContentUpdate(title, textareaText);
  };

  return (
      <div className="message-send-container">
        <h2 className="message-send-title">메시지 입력</h2>
        <div className="search-input-box">
          <input
              type="text"
              className="search-input"
              placeholder="제목을 입력해주세요."
              value={inputText}
              onChange={handleTitleChange}
          />
          <button
              className={`mic-button ${isRecordingInput ? "recording" : ""}`}
              onClick={handleMicInputClick}
              aria-label="녹음"
              disabled={isModalOpen} // 모달이 열려 있을 때는 비활성화
          >
            <img src={micIcon} alt="Mic" className="mic-icon" />
            {isRecordingInput && <div className="recording-animation"></div>}
          </button>
        </div>
        <textarea
            className="large-message-box"
            placeholder="내용을 입력해주세요."
            value={textareaText}
            onChange={handleTextChange}
        ></textarea>
        <div className="action-buttons">
          <button className="action-button" onClick={openModal}>
            AI 자동 생성
          </button>
          <button
              className={`mic-button2 ${isRecordingTextarea ? "recording" : ""}`}
              onClick={handleMicTextareaClick}
              aria-label="녹음"
              disabled={isModalOpen} // 모달이 열려 있을 때는 비활성화
          >
            <img src={micIcon} alt="Mic" className="mic-icon" />
            {isRecordingTextarea && <div className="recording-animation"></div>}
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}

        {/* AI 메시지 생성 모달 컴포넌트 */}
        <MessageCreate
            isOpen={isModalOpen}
            onClose={closeModal}
            onGeneratedMessage={handleGeneratedMessage}
            prompt={messageTitle || messageContent} // 프롬프트로 props 사용
        />
      </div>
  );
};

export default MessageSend;
