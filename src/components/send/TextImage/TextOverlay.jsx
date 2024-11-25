import React from "react";
import PropTypes from "prop-types";
import { Rnd } from "react-rnd";
import "./TextOverlay.css";

const TextOverlay = ({ text, index, handleTextChange, handleDeleteText }) => {
  const calculateFontSize = (width) => {
    return Math.max(10, Math.min(100, Math.floor(width / 10)));
  };

  return (
    <Rnd
      size={{ width: text.width, height: text.height }}
      position={{ x: text.x, y: text.y }}
      onDragStop={(e, d) => {
        handleTextChange(index, "position", { x: d.x, y: d.y });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        const newWidth = parseInt(ref.style.width, 10);
        const newHeight = parseInt(ref.style.height, 10);
        const newFontSize = calculateFontSize(newWidth);

        handleTextChange(index, "size", {
          width: newWidth,
          height: newHeight,
        });
        handleTextChange(index, "fontSize", newFontSize);
        handleTextChange(index, "position", position);
      }}
      minWidth={100}
      minHeight={30}
      className="text-rnd"
    >
      <div
        className="text-overlay-wrapper"
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        {/* 텍스트 영역 */}
        <div
          className="text-overlay"
          style={{
            color: text.color,
            fontSize: `${text.fontSize}px`,
            fontFamily: text.fontFamily,
            userSelect: "none",
            overflow: "hidden",
          }}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleTextChange(index, "content", e.target.innerText)}
        >
          {text.content}
        </div>

        {/* 삭제 버튼 */}
        <button
          className="text-delete-button"
          onClick={(e) => {
            e.stopPropagation(); // 버튼 클릭 시 부모 Rnd 이벤트 차단
            handleDeleteText(index); // 삭제 핸들러 호출
          }}
          aria-label="텍스트 삭제"
        >
          X
        </button>
      </div>
    </Rnd>
  );
};

TextOverlay.propTypes = {
  text: PropTypes.shape({
    content: PropTypes.string,
    color: PropTypes.string,
    fontSize: PropTypes.number,
    fontFamily: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
  }).isRequired,
  index: PropTypes.number.isRequired,
  handleTextChange: PropTypes.func.isRequired,
  handleDeleteText: PropTypes.func.isRequired, // 삭제 핸들러 추가
};

export default TextOverlay;
