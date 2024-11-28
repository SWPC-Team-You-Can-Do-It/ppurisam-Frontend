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

  // handleImageGenerated 함수 유지
  const handleImageGenerated = async (imageData) => {
    // imageData는 { fileName, base64Data, size, url } 형태
    const { fileName, base64Data, size, url } = imageData;

    try {
      // ImageSend의 상태를 업데이트하거나 컨텍스트에 저장
      setUploadedImageUrl(url);

      // ImageContext에 이미지 데이터 설정
      setImageData({
        fileName,
        base64Data,
        size,
        url,
      });
    } catch (err) {
      console.error("이미지 처리 중 오류 발생:", err);
    }

    // 모달 닫기
    setIsModalOpen(false);
  };

  // 이미지 파일을 JPEG로 변환하는 유틸리티 함수
  const convertImageToJpeg = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Canvas 변환 실패"));
              }
            },
            "image/jpeg",
            0.95
          ); // JPEG 형식으로 변환, 품질 0.95
        };
        img.onerror = () => {
          reject(new Error("이미지 로드 오류"));
        };
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
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

  // 파일 선택 시 호출되는 핸들러
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // 이미지가 JPEG 형식인지 확인
      if (file.type !== "image/jpeg") {
        // JPEG로 변환
        const jpegBlob = await convertImageToJpeg(file);

        // 새 File 객체 생성 (JPEG 형식)
        const jpegFile = new File(
          [jpegBlob],
          `${file.name.split(".")[0]}.jpg`,
          { type: "image/jpeg" }
        );

        // FormData에 JPEG 파일 추가
        const formData = new FormData();
        formData.append("file", jpegFile);

        // 이미지 업로드
        const response = await axiosInstance.post(
          "/api/image/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const fileUrl = response.data; // 예: '/images/image_12345.jpg'
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const serverImageUrl = `${backendUrl}${fileUrl}`;

        setUploadedImageUrl(serverImageUrl);

        const fileName = fileUrl.split("/").pop();

        // JPEG 파일을 Base64로 변환 (순수 Base64 문자열)
        const base64Data = await convertFileToBase64(jpegFile);
        console.log("Converted Base64 Data:", base64Data); // 디버깅용 로그

        setImageData({
          fileName,
          base64Data, // Base64 데이터 포함
          size: jpegBlob.size, // JPEG Blob의 크기
          url: serverImageUrl,
        });
      } else {
        // JPEG 형식인 경우 기존 로직 유지
        const formData = new FormData();
        formData.append("file", file);

        // 이미지 업로드
        const response = await axiosInstance.post(
          "/api/image/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const fileUrl = response.data; // 예: '/images/image_12345.jpg'
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const serverImageUrl = `${backendUrl}${fileUrl}`;

        setUploadedImageUrl(serverImageUrl);

        const fileName = fileUrl.split("/").pop();

        // 파일을 Base64로 변환 (순수 Base64 문자열)
        const base64Data = await convertFileToBase64(file);
        console.log("Converted Base64 Data:", base64Data); // 디버깅용 로그

        setImageData({
          fileName,
          base64Data, // Base64 데이터 포함
          size: file.size,
          url: serverImageUrl,
        });
      }
    } catch (error) {
      console.error("이미지 업로드 중 오류 발생:", error);
    }
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

      <button className="ai-image-button" onClick={openModal}>
        AI 이미지 생성
      </button>
      <ImageCreate
        isOpen={isModalOpen}
        onClose={closeModal}
        onImageGenerated={handleImageGenerated} // 콜백 전달
        initialPrompt={messageContent}
      />
    </div>
  );
};

export default ImageSend;
