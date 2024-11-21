// src/components/send/ThemeSelection/TextThemeSelectionModal.jsx

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./TextThemeSelectionModal.css";
import axiosInstance from "@/components/login/axiosInstance";

const TextThemeSelectionModal = ({
  isOpen,
  onClose,
  onSelectTheme,
  selectedTheme,
}) => {
  const [themes, setThemes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 테마 목록 불러오기
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError("");
      axiosInstance
        .get("/api/text-ai/themes")
        .then((response) => {
          const fetchedThemes = response.data.map((theme) => theme.theme);
          setThemes(fetchedThemes);

          // 기본 테마가 목록에 있으면 선택, 없으면 첫 번째 테마 선택
          if (fetchedThemes.includes("기본")) {
            onSelectTheme("기본");
          } else if (fetchedThemes.length > 0) {
            onSelectTheme(fetchedThemes[0]);
          }
        })
        .catch((err) => {
          console.error("텍스트 테마 로드 오류:", err);
          setError("텍스트 테마를 불러오는 중 오류가 발생했습니다.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, onSelectTheme]);

  const handleThemeSelect = (theme) => {
    onSelectTheme(theme);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="text-theme-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="text-theme-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>텍스트 테마 선택</h3>
        {isLoading ? (
          <p>로딩 중...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div className="text-theme-buttons">
            {themes.map((theme) => (
              <button
                key={theme}
                className={`text-theme-button ${
                  selectedTheme === theme ? "selected" : ""
                }`}
                onClick={() => handleThemeSelect(theme)}
                aria-pressed={selectedTheme === theme}
              >
                {theme}
              </button>
            ))}
          </div>
        )}
        <button className="text-theme-close-button" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
};

TextThemeSelectionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectTheme: PropTypes.func.isRequired,
  selectedTheme: PropTypes.string,
};

TextThemeSelectionModal.defaultProps = {
  selectedTheme: "기본",
};

export default TextThemeSelectionModal;
