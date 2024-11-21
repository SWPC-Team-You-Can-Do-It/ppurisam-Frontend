/* src/components/send/ThemeSelection/ImageThemeSelectionModal.jsx */

import React from "react";
import PropTypes from "prop-types";
import "./ImageThemeSelectionModal.css"; // 별도의 CSS 파일 생성

const ThemeSelectionModal = ({
  isOpen,
  onClose,
  onSelectTheme,
  selectedTheme,
  themes, // 외부에서 전달받은 테마 목록
  isLoading, // 테마 로딩 상태
  error, // 테마 로딩 오류 메시지
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="theme-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="theme-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>테마 선택</h3>
        {isLoading ? (
          <p>로딩 중...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div className="theme-buttons">
            {themes.map((theme) => (
              <button
                key={theme}
                className={`theme-button ${
                  selectedTheme === theme ? "selected" : ""
                }`}
                onClick={() => onSelectTheme(theme)}
                aria-pressed={selectedTheme === theme}
              >
                {theme}{" "}
                {selectedTheme === theme && (
                  <span className="checkmark">✔️</span>
                )}
              </button>
            ))}
          </div>
        )}
        <button className="close-theme-modal" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
};

ThemeSelectionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectTheme: PropTypes.func.isRequired,
  selectedTheme: PropTypes.string,
  themes: PropTypes.arrayOf(PropTypes.string).isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};

ThemeSelectionModal.defaultProps = {
  isLoading: false,
  error: "",
};

export default ThemeSelectionModal;
