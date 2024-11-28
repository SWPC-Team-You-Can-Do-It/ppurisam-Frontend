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
  const [textFont, setTextFont] = useState("프리텐다드"); // 기본값을 프리텐다드로 설정
  const [textSize, setTextSize] = useState(16);

  const imageContainerRef = useRef(null); // 이미지 및 텍스트 영역 참조

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
      // Step 1: AI를 사용하여 이미지 생성
      const requestData = { prompt };
      if (selectedTheme) {
        requestData.theme = selectedTheme;
      }
      const response = await axiosInstance.post(`/api/image-ai`, requestData);
      const generatedImageUrl = response.data;

      if (generatedImageUrl) {
        // Step 2: 생성된 이미지를 백엔드에 업로드
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

        // Step 3: 저장된 이미지 URL을 상태로 설정하여 표시
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
      // 모달을 유지하여 사용자가 결과를 확인할 수 있도록 합니다.
      // onClose(); // 필요 시 주석 해제
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

  // 텍스트 삭제 핸들러
  const handleDeleteText = (index) => {
    setTexts((prevTexts) => prevTexts.filter((_, idx) => idx !== index));
  };

  // 텍스트 추가 버튼 핸들러
  const handleAddText = () => {
    setTexts([
      ...texts,
      {
        id: uuidv4(), // 고유한 id 생성
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
  };

  // 텍스트 상태 업데이트 핸들러
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

  // 파일을 Base64로 변환하는 유틸리티 함수
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        const result = reader.result;
        const base64String = result.split(",")[1]; // "data:image/jpeg;base64," 부분 제거
        resolve(base64String);
      };

      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  // Helper 함수: 캔버스를 Blob으로 변환하며 크기가 300KB 이하가 될 때까지 품질을 낮춤
  const getCompressedBlob = (canvas, maxSizeKB = 300) => {
    return new Promise((resolve, reject) => {
      let quality = 0.95; // 초기 품질
      const step = 0.05; // 품질 감소 단계

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

  // "이미지 사용하기" 버튼 핸들러
  const handleUseImage = async () => {
    if (!imageUrl) {
      setError("사용할 이미지가 없습니다.");
      return;
    }

    // imageContainerRef를 사용하여 이미지와 텍스트 캡쳐
    if (imageContainerRef.current) {
      try {
        const canvas = await html2canvas(imageContainerRef.current, {
          useCORS: true, // CORS 설정이 필요한 경우
          scale: 1, // 캔버스 스케일 조정 (필요 시 변경)
        });

        // 캔버스를 Blob으로 변환하면서 크기 제한
        const blob = await getCompressedBlob(canvas, 300); // 300KB 이하

        if (blob) {
          // 새로운 이미지 파일 생성
          const newImageFile = new File([blob], "captured_image.jpg", {
            type: "image/jpeg",
          });

          // 백엔드에 업로드
          const formData = new FormData();
          formData.append("file", newImageFile);

          try {
            const uploadResponse = await axiosInstance.post(
              "/api/image/upload",
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );

            const fileUrl = uploadResponse.data; // 예: '/images/captured_image_12345.jpg'
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const serverImageUrl = `${backendUrl}${fileUrl}`;

            // ImageSend으로 전송
            if (onImageGenerated) {
              const base64Data = await convertFileToBase64(newImageFile);
              onImageGenerated({
                fileName: fileUrl.split("/").pop(),
                base64Data,
                size: blob.size,
                url: serverImageUrl,
              });
            }

            // 필요한 경우 상태 업데이트
            setImageUrl(serverImageUrl);
            setError(""); // 에러 초기화
          } catch (uploadError) {
            console.error("이미지 업로드 오류:", uploadError);
            setError("이미지 사용 중 업로드 오류가 발생했습니다.");
          }
        } else {
          setError("이미지를 캡쳐할 수 없습니다.");
        }
      } catch (captureError) {
        console.error("캡쳐 오류:", captureError);
        setError("이미지를 캡쳐하는 중 오류가 발생했습니다.");
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
                textSize={textSize}
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
            <div
              className="image-create-image-display-box"
              ref={imageContainerRef} // ref 추가
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
                      key={text.id} // 고유한 id 사용
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
              onClick={handleUseImage} // 수정된 핸들러 연결
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
