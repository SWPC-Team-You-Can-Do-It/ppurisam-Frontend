// src/components/send/ImageCreate/TextOptions.jsx

import React from "react";
import PropTypes from "prop-types";
import "./TextOptions.css";

const TextOptions = ({
  textColor,
  setTextColor,
  textFont,
  setTextFont,
  textSize,
  setTextSize,
}) => {
  return (
    <div className="text-options">
      <label className="text-option-label">
        색상:
        <input
          type="color"
          value={textColor}
          onChange={(e) => setTextColor(e.target.value)}
        />
      </label>
      <label className="text-option-label">
        폰트:
        <select value={textFont} onChange={(e) => setTextFont(e.target.value)}>
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          {/* 추가 폰트 옵션 */}
        </select>
      </label>
    </div>
  );
};

TextOptions.propTypes = {
  textColor: PropTypes.string.isRequired,
  setTextColor: PropTypes.func.isRequired,
  textFont: PropTypes.string.isRequired,
  setTextFont: PropTypes.func.isRequired,
};

export default TextOptions;
