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

  // Handle mic button click for input
  const handleMicInputClick = async () => {
    if (isRecordingInput) {
      try {
        const file = await stopRecordingInput();
        if (file) {
          await handleAudioAvailable(file, "input");
        } else {
          setError("녹음된 파일이 없습니다.");
        }
      } catch (err) {
        console.error("녹음 중지 오류:", err);
        setError("녹음을 처리하는 중 오류가 발생했습니다.");
      }
    } else {
      startRecordingInput();
    }
  };

  // Handle mic button click for textarea
  const handleMicTextareaClick = async () => {
    if (isRecordingTextarea) {
      try {
        const file = await stopRecordingTextarea();
        if (file) {
          await handleAudioAvailable(file, "textarea");
        } else {
          setError("녹음된 파일이 없습니다.");
        }
      } catch (err) {
        console.error("녹음 중지 오류:", err);
        setError("녹음을 처리하는 중 오류가 발생했습니다.");
      }
    } else {
      startRecordingTextarea();
    }
  };

  // Handle generated message from AI
  const handleGeneratedMessage = (message) => {
    setTextareaText(message); // Set message content
    onContentUpdate(inputText, message); // Pass to parent
    closeModal(); // Close modal
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
              disabled={isModalOpen} // Disable when modal is open
          >
            {isRecordingInput ? "녹음 종료" : <img src={micIcon} alt="Mic" />}
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
              disabled={isModalOpen} // Disable when modal is open
          >
            {isRecordingTextarea ? "녹음 종료" : <img src={micIcon} alt="Mic" className="mic-icon" />}
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}

        {/* Modal component for AI message creation */}
        <MessageCreate
            isOpen={isModalOpen}
            onClose={closeModal}
            onGeneratedMessage={handleGeneratedMessage}
            prompt={messageTitle || messageContent} // Use props as prompt
        />
      </div>
  );
};

export default MessageSend;
