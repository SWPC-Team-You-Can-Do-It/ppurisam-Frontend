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
      <div className="text-option">
        <label htmlFor="text-color">색상:</label>
        <input
          type="color"
          id="text-color"
          value={textColor}
          onChange={(e) => setTextColor(e.target.value)}
        />
      </div>
      <div className="text-option">
        <label htmlFor="text-font">폰트:</label>
        <select
          id="text-font"
          value={textFont}
          onChange={(e) => setTextFont(e.target.value)}
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Verdana">Verdana</option>
        </select>
      </div>
      <div className="text-option">
        <label htmlFor="text-size">크기:</label>
        <input
          type="number"
          id="text-size"
          value={textSize}
          onChange={(e) => setTextSize(Number(e.target.value))}
          min="10"
          max="100"
        />
      </div>
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
