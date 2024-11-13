// src/components/main/Send/ImageCreate/ImageCreate.jsx

import React, { useState, useEffect } from "react";
import "./ImageCreate.css";
import micIcon from "@/assets/images/send/mic.png";
import axiosInstance from "../../login/axiosInstance";
import useAudioRecorder from "@/utils/useAudioRecorder"; // 커스텀 훅 임포트

const ImageCreate = ({ isOpen, onClose, onImageGenerated, initialPrompt }) => {
  const [isCreateMode, setIsCreateMode] = useState(true);
  const [prompt, setPrompt] = useState(initialPrompt || "");
  const [byteCount, setByteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState(null);

  const { isRecording, startRecording, stopRecording } = useAudioRecorder();

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      const byteLength = new Blob([initialPrompt]).size;
      setByteCount(byteLength);
    }
  }, [initialPrompt]);

  const handleToggle = () => {
    setIsCreateMode(!isCreateMode);
  };

  const handlePromptChange = (e) => {
    const text = e.target.value;
    setPrompt(text);
    // UTF-8 기준으로 바이트 수 계산
    const byteLength = new Blob([text]).size;
    setByteCount(byteLength);
  };

  const handleAudioAvailable = async (file) => {
    const formData = new FormData();
    formData.append("file", file, file.name);

    try {
      const response = await axiosInstance.post(`/api/stt`, formData);

      const transcription = response.data.text;
      setPrompt(transcription);
      // UTF-8 기준으로 바이트 수 계산
      const byteLength = new Blob([transcription]).size;
      setByteCount(byteLength);
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

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError("프롬프트를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");
    setImageUrl(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.post(`/api/image-ai`, { prompt });

      const imageUrl = response.data;
      console.log("Generated Image URL:", imageUrl);

      if (imageUrl) {
        setImageUrl(imageUrl);
        onImageGenerated && onImageGenerated(imageUrl); // 이 줄을 주석 처리하거나 삭제합니다.
      } else {
        setError("이미지 생성에 실패했습니다.");
      }
    } catch (err) {
      console.error("Axios Error:", err.response ? err.response.data : err);
      setError("이미지 생성 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 녹음 중지 시 WebM 파일을 서버로 전송
  const handleMicClick = async () => {
    if (isRecording) {
      try {
        const file = await stopRecording();
        if (file) {
          await handleAudioAvailable(file);
        }
      } catch (err) {
        console.error("녹음 중지 오류:", err);
        setError("녹음을 처리하는 중 오류가 발생했습니다.");
      }
    } else {
      startRecording();
    }
  };

  // 이미지 사용하기 버튼 클릭 시 호출되는 함수
  const handleUseImage = () => {
    if (imageUrl && onImageGenerated) {
      onImageGenerated(imageUrl);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="image-create-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="image-create-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="image-create-close-button"
          onClick={onClose}
          aria-label="나가기"
        >
          나가기
        </button>

        <div className="image-create-modal-header">
          <button
            className={`image-create-toggle-button ${
              isCreateMode ? "active" : ""
            }`}
            onClick={() => !isCreateMode && handleToggle()}
          >
            이미지 생성하기
          </button>
          <button
            className={`image-create-toggle-button ${
              !isCreateMode ? "active" : ""
            }`}
            onClick={() => isCreateMode && handleToggle()}
          >
            이미지 수정하기
          </button>
        </div>

        <div className="image-create-body">
          {/* 왼쪽 섹션 */}
          <div className="left-section">
            <div className="image-create-prompt-section">
              <label className="image-create-prompt-label">
                이미지 프롬프트 내용
                <span className="image-create-required">*</span>
              </label>
              <textarea
                className="image-create-prompt-textbox"
                placeholder="프롬프트 할 내용을 적으시오"
                value={prompt}
                onChange={handlePromptChange}
              ></textarea>
            </div>
            {/* 마이크 버튼 */}
            <button
              className={`image-create-mic-button ${
                isRecording ? "recording" : ""
              }`}
              onClick={handleMicClick}
              aria-label="녹음"
              disabled={isLoading}
            >
              {isRecording ? "녹음 종료" : <img src={micIcon} alt="Mic" />}
            </button>
            {error && <div className="error-message">{error}</div>}
            <button
              className="image-create-generate-button"
              onClick={handleGenerateImage}
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? "생성 중..." : "이미지 생성하기"}
            </button>
          </div>

          {/* 오른쪽 섹션 */}
          <div className="right-section">
            <span className="image-create-result-text">생성 결과</span>
            <div className="image-create-image-display-box">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`생성된 이미지: ${prompt}`}
                  className="generated-image"
                />
              ) : (
                <p className="placeholder-text">
                  여기에 생성된 이미지가 표시됩니다.
                </p>
              )}
            </div>
            <button
              className={`image-create-delete-button ${
                !isCreateMode ? "green-button" : ""
              }`}
              onClick={() => {
                if (isCreateMode) setImageUrl(null);
                else handleToggle();
              }}
              disabled={!imageUrl}
            >
              {isCreateMode ? "삭제" : "되돌리기"}
            </button>
            <button
              className="image-create-use-image-button"
              onClick={handleUseImage}
              disabled={!imageUrl}
            >
              이미지 사용하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCreate;
