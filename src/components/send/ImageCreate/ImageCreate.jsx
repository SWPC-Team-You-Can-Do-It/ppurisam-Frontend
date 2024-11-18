// src/components/send/ImageCreate/ImageCreate.jsx

import React, { useState, useEffect } from "react";
import "./ImageCreate.css";
import micIcon from "@/assets/images/send/mic.png";
import axiosInstance, {
  fetchAndStorePpurioToken,
} from "@/components/login/axiosInstance";
import useAudioRecorder from "@/utils/useAudioRecorder";
import ThemeSelectionModal from "@/components/send/ThemeSelection/ThemeSelectionModal";

const ImageCreate = ({ isOpen, onClose, onImageGenerated, initialPrompt }) => {
  const [prompt, setPrompt] = useState(initialPrompt || "");
  const [byteCount, setByteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState(null);

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("");

  // 테마 데이터 상태
  const [themes, setThemes] = useState([]);
  const [isLoadingThemes, setIsLoadingThemes] = useState(false);
  const [themesError, setThemesError] = useState("");

  // 녹음 종료 시 파일을 처리하기 위한 콜백 함수 전달
  const { isRecording, startRecording, stopRecording } = useAudioRecorder(async (file) => {
    if (file) {
      await handleAudioAvailable(file);
    }
  });

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      const byteLength = new Blob([initialPrompt]).size;
      setByteCount(byteLength);
    }
  }, [initialPrompt]);

  // ImageCreate가 열릴 때 테마 목록을 가져오고 기본 테마 설정
  useEffect(() => {
    if (isOpen) {
      setIsLoadingThemes(true);
      setThemesError("");
      axiosInstance
          .get("/api/image-ai/themes")
          .then((response) => {
            const fetchedThemes = response.data.map((item) => item.theme);
            setThemes(fetchedThemes);

            // 기본 테마 설정
            if (fetchedThemes.includes("빈티지")) {
              setSelectedTheme("빈티지");
            } else if (fetchedThemes.includes("레트로")) {
              setSelectedTheme("레트로");
            } else if (fetchedThemes.length > 0) {
              setSelectedTheme(fetchedThemes[0]);
            }
          })
          .catch((err) => {
            console.error("테마 로드 오류:", err);
            setThemesError("테마를 불러오는 중 오류가 발생했습니다.");
          })
          .finally(() => {
            setIsLoadingThemes(false);
          });
    }
  }, [isOpen]);

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
      const requestData = { prompt };
      if (selectedTheme) {
        requestData.theme = selectedTheme; // 테마 정보 추가
      }
      const response = await axiosInstance.post(`/api/image-ai`, requestData);

      const imageUrl = response.data;

      if (imageUrl) {
        setImageUrl(imageUrl);
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

  // 녹음 중지 시 파일을 처리
  const handleMicClick = () => {
    if (isRecording) {
      stopRecording(); // 녹음 종료 (수동)
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

  const handleThemeSelect = (theme) => {
    setSelectedTheme(theme);
    setIsThemeModalOpen(false);
    // 선택된 테마에 따라 추가 작업 수행 가능
    // 예: 프롬프트에 테마 정보를 추가하거나 스타일 변경
  };

  // 로그인 후 Ppurio 토큰 저장 (예시)
  useEffect(() => {
    // 로그인 상태를 확인하고, 로그인 시 fetchAndStorePpurioToken 호출
    const token = localStorage.getItem("token");
    if (token) {
      fetchAndStorePpurioToken();
    }
  }, [isOpen]); // isOpen 변경 시 확인 (필요에 따라 수정)

  if (!isOpen) return null;

  return (
      <div
          className={`image-create-modal-overlay ${
              selectedTheme ? `theme-${selectedTheme}` : ""
          }`}
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
            <span className="image-create-modal-title">이미지 생성하기</span>
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
                <img src={micIcon} alt="Mic" />
                {isRecording && <div className="recording-animation"></div>}
              </button>

              {/* 테마 및 텍스트 추가 버튼 */}
              <div className="theme-and-text-buttons">
                <button
                    className="image-create-theme-toggle-button"
                    onClick={() => setIsThemeModalOpen(true)}
                >
                  {selectedTheme}
                </button>
                <button
                    className="image-create-add-text-button"
                    onClick={() => alert("텍스트 추가 기능 추가 예정!")}
                >
                  텍스트 추가
                </button>
              </div>

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
                  className="image-create-delete-button"
                  onClick={() => setImageUrl(null)}
                  disabled={!imageUrl}
              >
                삭제
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

        {/* 테마 선택 모달 컴포넌트 임포트 및 사용 */}
        <ThemeSelectionModal
            isOpen={isThemeModalOpen}
            onClose={() => setIsThemeModalOpen(false)}
            onSelectTheme={handleThemeSelect}
            selectedTheme={selectedTheme}
            themes={themes}
            isLoading={isLoadingThemes}
            error={themesError}
        />
      </div>
  );
};

export default ImageCreate;
