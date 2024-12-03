// src/components/send/ImageCreate/ImageCreate.jsx

import React, { useState, useEffect, useRef } from "react";
import "./ImageCreate.css";
import micIcon from "@/assets/images/send/mic.png";
import axiosInstance, {
  fetchAndStorePpurioToken,
} from "@/components/login/axiosInstance";
import useAudioRecorder from "@/utils/useAudioRecorder";
import ThemeSelectionModal from "@/components/send/ThemeSelection/ImageThemeSelectionModal";
import TextOptions from "../TextImage/TextOptions";
import TextOverlay from "../TextImage/TextOverlay";
import { v4 as uuidv4 } from "uuid"; // uuid 라이브러리 추가
import html2canvas from "html2canvas"; // html2canvas 임포트

const ImageCreate = ({ isOpen, onClose, onImageGenerated, initialPrompt }) => {
  const [prompt, setPrompt] = useState(initialPrompt || "");
  const [byteCount, setByteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [isTextAdded, setIsTextAdded] = useState(false);

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
  const [textFont, setTextFont] = useState("프리텐다드");
  const [textSize, setTextSize] = useState(20);

  const imageContainerRef = useRef(null);

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
      const generatedImageUrl = response.data;

      if (generatedImageUrl) {
        const uploadResponse = await axiosInstance.post(
          `/api/image/download-and-save`,
          null,
          {
            params: { url: generatedImageUrl },
          }
        );

        const filePath = uploadResponse.data;
        const fileName = filePath.split("/").pop();
        console.log("Received fileName from server:", fileName);

        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const savedImageUrl = `${backendUrl}/images/${fileName}`;

        setImageUrl(savedImageUrl);
      } else {
        setError("이미지 생성에 실패했습니다.");
      }
      console.log(generatedImageUrl);
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

  const handleThemeSelect = (theme) => {
    setSelectedTheme(theme);
    setIsThemeModalOpen(false);
  };

  const handleDeleteText = (index) => {
    setTexts((prevTexts) => prevTexts.filter((_, idx) => idx !== index));
  };

  const handleAddText = () => {
    setTexts([
      ...texts,
      {
        id: uuidv4(),
        content: "텍스트 입력",
        color: textColor,
        fontFamily: textFont,
        fontSize: textSize,
        x: 50,
        y: 50,
        width: 200,
        height: 50,
      },
    ]);
    setIsTextAdded(true);
  };

  const handleTextChange = (index, field, value) => {
    setTexts((prevTexts) =>
      prevTexts.map((text, idx) => {
        if (idx === index) {
          console.log(`Updating text ${idx}: ${field} to`, value);
          return { ...text, [field]: value };
        }
        return text;
      })
    );
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        const result = reader.result;
        const base64String = result.split(",")[1];
        resolve(base64String);
      };

      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const getCompressedBlob = (canvas, maxSizeKB = 300) => {
    return new Promise((resolve, reject) => {
      let quality = 0.95;
      const step = 0.05;

      const attempt = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("캔버스 Blob 변환 실패"));
              return;
            }

            if (blob.size / 1024 <= maxSizeKB || quality <= 0.1) {
              resolve(blob);
            } else {
              quality -= step;
              attempt();
            }
          },
          "image/jpeg",
          quality
        );
      };

      attempt();
    });
  };

  const handleUseImage = async () => {
    if (!imageUrl) {
      setError("사용할 이미지가 없습니다.");
      return;
    }

    // 텍스트가 추가되지 않은 경우, 원본 이미지를 그대로 사용
    if (!isTextAdded) {
      if (onImageGenerated) {
        onImageGenerated({
          fileName: imageUrl.split("/").pop(),
          base64Data: null,
          size: null,
          url: imageUrl,
        });
      }
      return;
    }

    // 텍스트가 추가된 경우 캡처
    if (imageContainerRef.current) {
      try {
        // 이미지가 완전히 로드되었는지 확인
        const img = imageContainerRef.current.querySelector("img");
        if (!img || !img.complete) {
          setError("이미지가 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
          return;
        }

        // 캡처 영역을 설정: 컨테이너 전체 (이미지 + 텍스트)
        const canvas = await html2canvas(imageContainerRef.current, {
          useCORS: true, // CORS 문제를 해결
          scale: 2, // 고해상도 캡처
          backgroundColor: null, // 배경 투명화 (필요 시)
        });

        // 캡처한 Canvas를 Blob으로 변환
        const blob = await getCompressedBlob(canvas, 300); // 최대 크기: 300KB

        if (blob) {
          const newImageFile = new File([blob], "captured_image.jpg", {
            type: "image/jpeg",
          });

          // 캡처된 이미지를 서버로 업로드
          const formData = new FormData();
          formData.append("file", newImageFile);

          const response = await axiosInstance.post(
            "/api/image/upload",
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );

          const fileUrl = response.data;
          const backendUrl = import.meta.env.VITE_BACKEND_URL;
          const serverImageUrl = `${backendUrl}${fileUrl}`;

          // onImageGenerated 콜백 호출
          if (onImageGenerated) {
            const base64Data = await convertFileToBase64(newImageFile);
            onImageGenerated({
              fileName: fileUrl.split("/").pop(),
              base64Data,
              size: blob.size,
              url: serverImageUrl,
            });
          }
        } else {
          setError("이미지를 캡처할 수 없습니다.");
        }
      } catch (error) {
        console.error("캡처 오류:", error);
        setError("이미지를 캡처하는 중 오류가 발생했습니다.");
      }
    }
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
              {/* 음성인식 버튼을 라벨 오른쪽에 위치 */}
              <button
                className={`mic-button2 ${isRecording ? "recording" : ""}`}
                onClick={handleMicClick}
                aria-label="녹음"
                disabled={isLoading}
              >
                <img src={micIcon} alt="Mic" className="mic-icon" />
                {isRecording && <div className="recording-animation"></div>}
              </button>
            </div>
            <textarea
              className="image-create-prompt-textbox"
              placeholder="프롬프트 할 내용을 적으시오"
              value={prompt}
              onChange={handlePromptChange}
            ></textarea>

            {/* 텍스트 옵션 */}
            <TextOptions
              textColor={textColor}
              setTextColor={setTextColor}
              textFont={textFont}
              setTextFont={setTextFont}
              textSize={textSize}
              setTextSize={setTextSize}
            />

            {/* 테마 및 텍스트 추가 버튼 */}
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
            <div
              className="image-create-image-display-box"
              ref={imageContainerRef}
            >
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
                      key={text.id}
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
