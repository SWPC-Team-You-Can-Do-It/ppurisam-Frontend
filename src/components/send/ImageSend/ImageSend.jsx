import React, { useState, useRef, useContext } from "react";
import "./ImageSend.css";
import imageButton from "@/assets/images/send/imagebutton.png";
import axiosInstance from "../../login/axiosInstance";
import { ImageContext } from "../../../contexts/ImageContext";
import ImageCreate from "../ImageCreate/ImageCreate";

const ImageSend = ({ messageContent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const fileInputRef = useRef(null);

  const { setImageData } = useContext(ImageContext);

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
        base64Data: null, // 필요에 따라 Base64 변환 로직 추가
        size: file.size,
      });

      alert("이미지가 성공적으로 업로드되었습니다!");
    } catch (error) {
      console.error("이미지 업로드 중 오류 발생:", error);
      alert("이미지 업로드에 실패했습니다.");
    }
  };

  return (
      <div className="image-send-container">
        <h2 className="image-send-title">이미지 첨부</h2>
        <div className="image-upload-box">
          {uploadedImageUrl ? (
              <img
                  src={uploadedImageUrl}
                  alt="Uploaded"
                  className="uploaded-image"
              />
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
