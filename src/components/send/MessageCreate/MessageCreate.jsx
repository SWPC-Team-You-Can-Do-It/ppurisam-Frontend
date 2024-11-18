// src/components/send/MessageCreate/MessageCreate.jsx

import React, { useState, useEffect } from "react";
import "./MessageCreate.css";
import micIcon from "@/assets/images/send/mic.png";
import axiosInstance from "@/components/login/axiosInstance";
import useAudioRecorder from "@/utils/useAudioRecorder";

const MessageCreate = ({ isOpen, onClose, onGeneratedMessage }) => {
  const [prompt, setPrompt] = useState("");
  const [byteCount, setByteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");

  // 녹음 종료 시 파일을 처리하기 위한 콜백 함수 전달
  const { isRecording, startRecording, stopRecording } = useAudioRecorder(async (file) => {
    await handleAudioAvailable(file);
  });

  useEffect(() => {
    // 바이트 카운트 업데이트
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
        // 서버가 응답했으나 상태 코드가 2xx가 아닌 경우
        setError(err.response.data.message || "서버 오류가 발생했습니다.");
      } else if (err.request) {
        // 요청이 이루어졌으나 응답을 받지 못한 경우
        setError("서버로부터 응답을 받지 못했습니다.");
      } else {
        // 오류를 발생시킨 요청 설정 중 문제가 있는 경우
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
                <div className="message-create-byte-counter"></div>
              </div>
              <button
                  className={`message-create-mic-button ${
                      isRecording ? "recording" : ""
                  }`}
                  onClick={handleMicClick}
                  aria-label="녹음"
                  disabled={isLoading}
              >
                <img src={micIcon} alt="Mic" />
                {isRecording && <div className="recording-animation"></div>}
              </button>
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
              <div className="message-create-image-display-box">
                {generatedMessage ? (
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
                  className="message-create-use-image-button"
                  disabled={!generatedMessage}
                  onClick={handleUseMessage}
              >
                메시지 사용하기
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default MessageCreate;
