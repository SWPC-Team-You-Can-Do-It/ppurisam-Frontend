import React, { useState } from "react";
import "./MessageSend.css";
import micIcon from "@/assets/images/send/mic.png";
import MessageCreate from "../MessageCreate/MessageCreate";
import axiosInstance from "../../login/axiosInstance";
import useAudioRecorder from "@/utils/useAudioRecorder";
import PropTypes from "prop-types";

const MessageSend = ({ onContentUpdate, messageTitle, messageContent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputText, setInputText] = useState(messageTitle || "");
  const [textareaText, setTextareaText] = useState(messageContent || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 오디오 녹음 핸들러
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

  // 마이크 버튼 클릭 핸들러 (입력 필드용)
  const handleMicInputClick = () => {
    if (isRecordingInput) {
      stopRecordingInput(); // 녹음 종료
    } else {
      startRecordingInput();
    }
  };

  // 마이크 버튼 클릭 핸들러 (텍스트 영역용)
  const handleMicTextareaClick = () => {
    if (isRecordingTextarea) {
      stopRecordingTextarea(); // 녹음 종료
    } else {
      startRecordingTextarea();
    }
  };

  // AI로부터 생성된 메시지 핸들러
  const handleGeneratedMessage = (message) => {
    setTextareaText(message);
    onContentUpdate(inputText, message);
    closeModal();
  };

  // 텍스트 변경 핸들러 (입력 필드)
  const handleTitleChange = (e) => {
    const title = e.target.value;
    setInputText(title);
    onContentUpdate(title, textareaText);
  };

  // 텍스트 변경 핸들러 (텍스트 영역)
  const handleTextChange = (e) => {
    const text = e.target.value;
    setTextareaText(text);
    onContentUpdate(inputText, text);
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

      {/* 에러 및 성공 메시지 */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

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

// PropTypes 정의
MessageSend.propTypes = {
  onContentUpdate: PropTypes.func.isRequired,
  messageTitle: PropTypes.string,
  messageContent: PropTypes.string,
};

export default MessageSend;
