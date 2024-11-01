// src/components/main/Send/ImageCreate/ImageCreate.jsx

import React, { useState } from "react";
import "./ImageCreate.css";
import micIcon from "@/assets/images/send/mic.png";
import axios from "axios";
import useAudioRecorder from "@/utils/useAudioRecorder"; // 커스텀 훅 임포트

const ImageCreate = ({ isOpen, onClose, onImageGenerated }) => {
  const [isCreateMode, setIsCreateMode] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [byteCount, setByteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [audioURL, setAudioURL] = useState(null); // 오디오 URL 상태 추가

  const { isRecording, startRecording, stopRecording } = useAudioRecorder();

  const handleToggle = () => {
    setIsCreateMode(!isCreateMode);
  };

  const handlePromptChange = (e) => {
    const text = e.target.value.slice(0, 200);
    setPrompt(text);
    // UTF-8 기준으로 바이트 수 계산
    const byteLength = new Blob([text]).size;
    setByteCount(byteLength);
  };

  const handleAudioAvailable = async (file) => {
    console.log("File:", file);
    console.log("File Name:", file.name);
    console.log("File Type:", file.type);

    // 오디오 미리보기 설정
    const url = URL.createObjectURL(file);
    setAudioURL(url); // 상태에 오디오 URL 저장

    const formData = new FormData();
    formData.append("file", file, file.name); // 파일 이름과 타입 일치

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/stt`,
        formData
      );

      const transcription = response.data.text;
      setPrompt(transcription);
      // UTF-8 기준으로 바이트 수 계산
      const byteLength = new Blob([transcription]).size;
      setByteCount(byteLength);
    } catch (err) {
      console.error("파일 전송 오류:", err); // 전체 에러 객체를 로그
      if (err.response) {
        // 서버가 응답했으나 상태 코드가 2xx가 아닌 경우
        console.error("응답 데이터:", err.response.data);
        console.error("응답 상태:", err.response.status);
        console.error("응답 헤더:", err.response.headers);
        setError(
          `서버 오류: ${err.response.data.message || "알 수 없는 오류"}`
        );
      } else if (err.request) {
        // 요청이 만들어졌으나 응답을 받지 못한 경우
        console.error(
          "요청이 만들어졌으나 응답을 받지 못했습니다:",
          err.request
        );
        setError("서버에 응답이 없습니다. 네트워크 상태를 확인해주세요.");
      } else {
        // 다른 오류
        console.error("오류 메시지:", err.message);
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
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/image-ai`,
        { prompt }
      );

      const imageUrl = response.data;
      console.log("Generated Image URL:", imageUrl);

      if (imageUrl) {
        setImageUrl(imageUrl);
        onImageGenerated && onImageGenerated(imageUrl);
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
              <div className="image-create-byte-counter">
                {byteCount} / 200byte
              </div>
            </div>
            <div className="image-create-mic-section">
              <button
                className="image-create-mic-button"
                onClick={handleMicClick}
                aria-label="녹음"
              >
                <img src={micIcon} alt="Mic" />
                {isRecording ? "녹음 중지" : "녹음 시작"}
              </button>
            </div>
            <button
              className="image-create-generate-button"
              onClick={handleGenerateImage}
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? "생성 중..." : "이미지 생성하기"}
            </button>
            {/* 오디오 미리보기 및 다운로드 링크 */}
            {audioURL && (
              <div className="audio-preview" style={{ marginTop: "10px" }}>
                <audio controls src={audioURL}></audio>
              </div>
            )}
            {error && <div className="error-message">{error}</div>}
          </div>

          {/* 오른쪽 섹션 */}
          <div className="right-section">
            <span className="image-create-result-text">생성 결과</span>
            <div className="image-create-image-display-box">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={`생성된 이미지: ${prompt}`}
                  className="generated-image"
                />
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
            >
              {isCreateMode ? "삭제" : "되돌리기"}
            </button>
            <button
              className="image-create-use-image-button"
              onClick={() => imageUrl && onImageGenerated(imageUrl)}
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
