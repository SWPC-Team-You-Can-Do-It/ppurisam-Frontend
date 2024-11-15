// src/components/send/ImageSend/ImageSend.jsx

import React, { useState, useRef, useContext } from 'react';
import './ImageSend.css';
import imageButton from '@/assets/images/send/imagebutton.png';
import axiosInstance from "../../login/axiosInstance";
import { ImageContext } from '../../../contexts/ImageContext'; // ImageContext 임포트
import ImageCreate from '../ImageCreate/ImageCreate';

const ImageSend = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    const fileInputRef = useRef(null);

    const { setImageData } = useContext(ImageContext); // ImageContext 사용

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleImageGenerated = async (imageUrlObject) => {
        const imageUrl = imageUrlObject;
        try {
            const response = await axiosInstance.post(`/api/image/download-and-save`, null, {
                params: { url: imageUrl },
            });

            const filePath = response.data; // 서버에서 반환한 파일 경로 (예: 'image_...jpg')
            const fileName = filePath.split('/').pop();
            console.log('Received fileName from server:', fileName); // 디버깅용 로그

            // VITE_BACKEND_URL을 사용하여 전체 이미지 URL 생성
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const serverImageUrl = `${backendUrl}/images/${fileName}`;

            setUploadedImageUrl(serverImageUrl);

            // 이미지 데이터를 Context에 저장
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

    return (
        <div className="image-send-container">
            <h2 className="image-send-title">이미지 첨부</h2>
            <div className="image-upload-box">
                {uploadedImageUrl ? (
                    <img src={uploadedImageUrl} alt="Uploaded" className="uploaded-image" />
                ) : (
                    <div className="image-button" onClick={() => fileInputRef.current.click()}>
                        <img src={imageButton} alt="Upload" />
                    </div>
                )}
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    // 필요한 경우 onChange 핸들러 추가
                />
            </div>
            <button className="ai-image-button" onClick={openModal}>AI 이미지 생성</button>
            <ImageCreate isOpen={isModalOpen} onClose={closeModal} onImageGenerated={handleImageGenerated} />
        </div>
    );
};

export default ImageSend;
