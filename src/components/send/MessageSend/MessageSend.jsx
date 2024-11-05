import React, { useState } from "react";
import "./MessageSend.css";
import micIcon from "@/assets/images/send/mic.png";
import MessageCreate from "../MessageCreate/MessageCreate";
import axios from "axios";
import useAudioRecorder from "@/utils/useAudioRecorder";

const MessageSend = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [textareaText, setTextareaText] = useState("");
  const [error, setError] = useState("");

  const {
    isRecording: isRecordingInput,
    startRecording: startRecordingInput,
    stopRecording: stopRecordingInput,
  } = useAudioRecorder();
  const {
    isRecording: isRecordingTextarea,
    startRecording: startRecordingTextarea,
    stopRecording: stopRecordingTextarea,
  } = useAudioRecorder();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // 메시지 생성 완료 시 호출될 콜백 함수 정의
  const handleGeneratedMessage = (message) => {
    setTextareaText(message); // 생성된 메시지를 textarea에 설정
    closeModal(); // 모달 닫기
  };

  return (
    <div className="message-send-container">
      <h2 className="message-send-title">메시지 입력</h2>
      <div className="search-input-box">
        <input
          type="text"
          className="search-input"
          placeholder="내용을 입력해주세요."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button
          className={`mic-button ${isRecordingInput ? "recording" : ""}`}
          onClick={isRecordingInput ? stopRecordingInput : startRecordingInput}
          aria-label="녹음"
        >
          {isRecordingInput ? (
            "녹음 종료"
          ) : (
            <img src={micIcon} alt="Mic Icon" />
          )}
        </button>
      </div>
      <textarea
        className="large-message-box"
        placeholder="내용을 입력해주세요."
        value={textareaText}
        onChange={(e) => setTextareaText(e.target.value)}
      ></textarea>
      <div className="action-buttons">
        <button className="action-button" onClick={openModal}>
          AI 자동 생성
        </button>
        <button
          className={`mic-button2 ${isRecordingTextarea ? "recording" : ""}`}
          onClick={
            isRecordingTextarea ? stopRecordingTextarea : startRecordingTextarea
          }
          aria-label="녹음"
        >
          {isRecordingTextarea ? (
            "녹음 종료"
          ) : (
            <img src={micIcon} alt="Mic Icon" className="mic-icon" />
          )}
        </button>
      </div>
      <button
        className="submit-button1"
        onClick={() =>
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
          })
        }
      >
        작성 완료
      </button>

      {error && <div className="error-message">{error}</div>}

      {/* 모달 컴포넌트, onGeneratedMessage 콜백 전달 */}
      <MessageCreate
        isOpen={isModalOpen}
        onClose={closeModal}
        onGeneratedMessage={handleGeneratedMessage}
      />
    </div>
  );
};

export default MessageSend;
