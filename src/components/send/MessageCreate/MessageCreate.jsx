// src/components/send/MessageCreate/MessageCreate.jsx

import React, { useState, useEffect } from "react";
import "./MessageCreate.css";
import micIcon from "@/assets/images/send/mic.png";
import axiosInstance from "@/components/login/axiosInstance";
import useAudioRecorder from "@/utils/useAudioRecorder";
import TextThemeSelectionModal from "../ThemeSelection/TextThemeSelectionModal";

const MessageCreate = ({ isOpen, onClose, onGeneratedMessage }) => {
  const [prompt, setPrompt] = useState("");
  const [byteCount, setByteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");

  // 텍스트 테마 관련 상태
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [selectedTextTheme, setSelectedTextTheme] = useState("기본"); // 초기값 기본 테마

  const { isRecording, startRecording, stopRecording } = useAudioRecorder(
    async (file) => {
      await handleAudioAvailable(file);
    }
  );

  useEffect(() => {
    const bytes = new Blob([prompt]).size;
    setByteCount(bytes);
  }, [prompt]);

  const handleAudioAvailable = async (file) => {
    if (!file) {
      setError("녹음된 파일이 없습니다.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file, file.name);

    try {
      setIsLoading(true);
      setError("");

      const response = await axiosInstance.post("/api/stt", formData);
      const transcription = response.data.text;
      if (transcription) {
        setPrompt(transcription);
      } else {
        setError("음성 인식에 실패했습니다.");
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMessage = async () => {
    if (!prompt.trim()) {
      setError("프롬프트를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");
    setGeneratedMessage("");

    try {
      const response = await axiosInstance.post("/api/text-ai", {
        text: prompt,
        theme: selectedTextTheme, // 선택된 텍스트 테마 전달
      });

      const message = response.data.generated_text;
      if (message) {
        setGeneratedMessage(message);
      } else {
        setError("메시지 생성에 실패했습니다.");
      }
    } catch (err) {
      console.error("메시지 생성 오류:", err);
      if (err.response) {
        setError(err.response.data.message || "서버 오류가 발생했습니다.");
      } else if (err.request) {
        setError("서버로부터 응답을 받지 못했습니다.");
      } else {
        setError("요청 설정 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 마이크 버튼 클릭 핸들러
  const handleMicClick = () => {
    if (isRecording) {
      stopRecording(); // 녹음 종료 (수동)
    } else {
      startRecording();
    }
  };

  // 메시지 사용하기 버튼 클릭 시 콜백 호출
  const handleUseMessage = () => {
    if (onGeneratedMessage && generatedMessage) {
      onGeneratedMessage(generatedMessage); // 부모 컴포넌트로 메시지 전달
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="message-create-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="message-create-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="message-create-close-button"
          onClick={onClose}
          aria-label="나가기"
        >
          나가기
        </button>

        <div className="message-create-modal-header">
          <button
            className="message-create-toggle-button active"
            onClick={() => {}}
          >
            메시지 생성하기
          </button>
        </div>

        <div className="message-create-body">
          <div className="left-section">
            <div className="message-create-prompt-section">
              <label className="message-create-prompt-label">
                메시지 프롬프트 내용
                <span className="message-create-required">*</span>
              </label>
              <textarea
                className="message-create-prompt-textbox"
                placeholder="프롬프트 할 내용을 적으시오"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              ></textarea>
              <div className="message-create-byte-counter">
                바이트 수: {byteCount}
              </div>
            </div>

            <div className="button-row">
              <div className="button-container">
                <button
                  className={`message-create-mic-button ${
                    isRecording ? "recording" : ""
                  }`}
                  onClick={handleMicClick}
                  aria-label="녹음"
                  disabled={isLoading}
                >
                  <img src={micIcon} alt="Mic" />
                </button>
                <button
                  className="message-create-theme-button"
                  onClick={() => setIsThemeModalOpen(true)}
                >
                  {selectedTextTheme || "테마 선택"}
                </button>
              </div>
            </div>

            <button
              className="message-create-generate-button"
              onClick={handleGenerateMessage}
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? "생성 중..." : "메시지 생성하기"}
            </button>
            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="right-section">
            <span className="message-create-result-text">생성 결과</span>
            <div className="message-create-result-display">
              {isLoading ? (
                <p className="loading-message">생성 중...</p>
              ) : generatedMessage ? (
                <p className="generated-message">{generatedMessage}</p>
              ) : (
                <p className="placeholder-text">
                  여기에 생성된 메시지가 표시됩니다.
                </p>
              )}
            </div>
            <button
              className="message-create-delete-button"
              onClick={() => setGeneratedMessage("")}
              disabled={!generatedMessage}
            >
              삭제
            </button>
            <button
              className="message-create-use-button"
              onClick={handleUseMessage}
              disabled={!generatedMessage}
            >
              메시지 사용하기
            </button>
          </div>
        </div>
      </div>

      <TextThemeSelectionModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        onSelectTheme={setSelectedTextTheme}
        selectedTheme={selectedTextTheme}
      />
    </div>
  );
};

export default MessageCreate;
