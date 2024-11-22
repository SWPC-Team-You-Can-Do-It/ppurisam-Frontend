// src/components/send/ImageSend/ImageSend.jsx

import React, { useState, useRef, useContext } from "react";
import "./ImageSend.css";
import imageButton from "@/assets/images/send/imagebutton.png";
import axiosInstance from "../../login/axiosInstance";
import { ImageContext } from "../../../contexts/ImageContext";
import ImageCreate from "../ImageCreate/ImageCreate";
import TextOptions from "../TextImage/TextOptions";
import TextOverlay from "../TextImage/TextOverlay";
import html2canvas from "html2canvas"; // 필요 시 import

const ImageSend = ({ messageContent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const fileInputRef = useRef(null);

  const { setImageData } = useContext(ImageContext);

  const [texts, setTexts] = useState([]);
  const [textColor, setTextColor] = useState("#000000");
  const [textFont, setTextFont] = useState("Arial");

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleImageGenerated = async (imageUrlObject) => {
    const imageUrl = imageUrlObject;
    try {
      const response = await axiosInstance.post(
        `/api/image/download-and-save`,
        null,
        {
          params: { url: imageUrl },
        }
      );

      const filePath = response.data;
      const fileName = filePath.split("/").pop();
      console.log("Received fileName from server:", fileName);

      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const serverImageUrl = `${backendUrl}/images/${fileName}`;

      setUploadedImageUrl(serverImageUrl);

      const base64Response = await axiosInstance.get(`/api/image/load-image`, {
        params: { fileName },
      });
      const base64Data = base64Response.data;

      const size = Math.floor((base64Data.length * 3) / 4);

      setImageData({
        fileName,
        base64Data,
        size,
        url: serverImageUrl,
      });
    } catch (err) {
      console.error("이미지 다운로드 및 저장 중 오류 발생:", err);
      alert("AI 이미지 다운로드 및 저장 중 오류가 발생했습니다.");
    }
    setIsModalOpen(false);
  };

  const initialPrompt = messageContent;

  // 파일 선택 시 호출되는 핸들러
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axiosInstance.post("/api/image/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const fileUrl = response.data; // 예: '/images/image_12345.jpg'
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const serverImageUrl = `${backendUrl}${fileUrl}`;

      setUploadedImageUrl(serverImageUrl);

      const fileName = fileUrl.split("/").pop();
      setImageData({
        fileName,
        base64Data: null,
        size: file.size,
        url: serverImageUrl,
      });

      alert("이미지가 성공적으로 업로드되었습니다!");
    } catch (error) {
      console.error("이미지 업로드 중 오류 발생:", error);
      alert("이미지 업로드에 실패했습니다.");
    }
  };

  // 텍스트 추가 버튼 핸들러
  const handleAddText = () => {
    setTexts([
      ...texts,
      {
        content: "텍스트 입력",
        color: textColor,
        fontFamily: textFont,
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
        if (field === "position") {
          return { ...text, x: value.x, y: value.y };
        }
        if (field === "size") {
          return { ...text, width: value.width, height: value.height };
        }
        if (field === "content") {
          return { ...text, content: value };
        }
        if (field === "color") {
          return { ...text, color: value };
        }
        if (field === "fontFamily") {
          return { ...text, fontFamily: value };
        }
        return { ...text, [field]: value };
      }
      return text;
    });
    setTexts(updatedTexts);
  };

  return (
    <div className="image-send-container">
      <h2 className="image-send-title">이미지 첨부</h2>
      <div className="image-upload-box">
        {uploadedImageUrl ? (
          <div className="image-container" style={{ position: "relative" }}>
            <img
              src={uploadedImageUrl}
              alt="Uploaded"
              className="uploaded-image"
            />
            {texts.map((text, index) => (
              <TextOverlay
                key={index}
                text={text}
                index={index}
                handleTextChange={handleTextChange}
              />
            ))}
          </div>
        ) : (
          <div
            className="image-button"
            onClick={() => fileInputRef.current.click()}
          >
            <img src={imageButton} alt="Upload" />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange} // onChange 핸들러 추가
        />
      </div>

      {/* 텍스트 추가 버튼 및 옵션 */}
      <div className="text-add-section">
        <button
          className="ai-image-button add-text-button"
          onClick={handleAddText}
        >
          텍스트 추가
        </button>
        <TextOptions
          textColor={textColor}
          setTextColor={setTextColor}
          textFont={textFont}
          setTextFont={setTextFont}
        />
      </div>

      <button className="ai-image-button" onClick={openModal}>
        AI 이미지 생성
      </button>
      <ImageCreate
        isOpen={isModalOpen}
        onClose={closeModal}
        onImageGenerated={handleImageGenerated}
        initialPrompt={initialPrompt}
      />
    </div>
  );
};

export default ImageSend;
