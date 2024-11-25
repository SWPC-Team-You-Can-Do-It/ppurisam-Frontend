import React, { useState, useEffect } from "react";
import "./ImageCreate.css";
import micIcon from "@/assets/images/send/mic.png";
import axiosInstance, {
  fetchAndStorePpurioToken,
} from "@/components/login/axiosInstance";
import useAudioRecorder from "@/utils/useAudioRecorder";
import ThemeSelectionModal from "@/components/send/ThemeSelection/ImageThemeSelectionModal";
import TextOptions from "../TextImage/TextOptions";
import TextOverlay from "../TextImage/TextOverlay";

const ImageCreate = ({ isOpen, onClose, onImageGenerated, initialPrompt }) => {
  const [prompt, setPrompt] = useState(initialPrompt || "");
  const [byteCount, setByteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState(null);

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("");

  const [themes, setThemes] = useState([]);
  const [isLoadingThemes, setIsLoadingThemes] = useState(false);
  const [themesError, setThemesError] = useState("");

  const { isRecording, startRecording, stopRecording } = useAudioRecorder(
    async (file) => {
      if (file) {
        await handleAudioAvailable(file);
      }
    }
  );

  const [texts, setTexts] = useState([]);
  const [textColor, setTextColor] = useState("#000000");
  const [textFont, setTextFont] = useState("Arial");
  const [textSize, setTextSize] = useState(16);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      const byteLength = new Blob([initialPrompt]).size;
      setByteCount(byteLength);
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingThemes(true);
      setThemesError("");
      axiosInstance
        .get("/api/image-ai/themes")
        .then((response) => {
          const fetchedThemes = response.data.map((item) => item.theme);
          setThemes(fetchedThemes);

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
        requestData.theme = selectedTheme;
      }
      const response = await axiosInstance.post(`/api/image-ai`, requestData);
      const imageUrl = response.data;

      if (imageUrl) {
        setImageUrl(imageUrl);
      } else {
        setError("이미지 생성에 실패했습니다.");
      }
      console.log(imageUrl);
    } catch (err) {
      console.error("Axios Error:", err.response ? err.response.data : err);
      setError("이미지 생성 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleUseImage = () => {
    if (imageUrl && onImageGenerated) {
      onImageGenerated(imageUrl);
    }
  };

  const handleThemeSelect = (theme) => {
    setSelectedTheme(theme);
    setIsThemeModalOpen(false);
  };

  // 텍스트 삭제 핸들러
  const handleDeleteText = (index) => {
    setTexts((prevTexts) => prevTexts.filter((_, idx) => idx !== index));
  };

  // 텍스트 추가 버튼 핸들러
  const handleAddText = () => {
    setTexts([
      ...texts,
      {
        content: "텍스트 입력",
        color: textColor,
        fontFamily: textFont,
        fontSize: textSize, // 폰트 크기 추가
        x: 50,
        y: 50,
        width: 200,
        height: 50,
      },
    ]);
  };

  // 텍스트 상태 업데이트 핸들러
  const handleTextChange = (index, field, value) => {
    const updatedTexts = texts.map((text, idx) => {
      if (idx === index) {
        return { ...text, [field]: value };
      }
      return text;
    });
    setTexts(updatedTexts);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchAndStorePpurioToken();
    }
  }, [isOpen]);

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

            <div className="theme-and-text-buttons">
              <button
                className="image-create-theme-toggle-button image-create-button"
                onClick={() => setIsThemeModalOpen(true)}
              >
                {selectedTheme || "테마 선택"}
              </button>

              <button
                className="image-create-add-text-button image-create-button"
                onClick={handleAddText}
              >
                텍스트 추가
              </button>

              <TextOptions
                textColor={textColor}
                setTextColor={setTextColor}
                textFont={textFont}
                setTextFont={setTextFont}
                setTextSize={setTextSize}
              />
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

          <div className="right-section">
            <span className="image-create-result-text">생성 결과</span>
            <div className="image-create-image-display-box">
              {imageUrl ? (
                <div
                  className="image-container"
                  style={{ position: "relative" }}
                >
                  <img
                    src={imageUrl}
                    alt={`생성된 이미지: ${prompt}`}
                    className="generated-image"
                  />
                  {texts.map((text, index) => (
                    <TextOverlay
                      key={index}
                      text={text}
                      index={index}
                      handleTextChange={handleTextChange}
                      handleDeleteText={handleDeleteText}
                    />
                  ))}
                </div>
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
