// src/components/main/Send/ImageSend/ImageSend.jsx
import React, { useState, useRef } from 'react';
import './ImageSend.css';
import imageButton from '@/assets/images/send/imagebutton.png';
import ImageCreate from '../ImageCreate/ImageCreate';

const ImageSend = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null); // 업로드된 이미지 상태
    const fileInputRef = useRef(null); // 파일 입력 요소에 대한 참조

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    // 이미지 버튼 클릭 시 파일 입력 트리거
    const handleImageButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // 이미지 선택 시 처리
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const imageUrl = URL.createObjectURL(file);
            setUploadedImage(imageUrl);
        } else {
            alert('이미지 파일을 선택해주세요.');
        }
    };

    return (
        <div className="image-send-container">
            <h2 className="image-send-title">이미지 첨부</h2>
            <div className="image-upload-box">
                {/* 업로드된 이미지가 있으면 표시 */}
                {uploadedImage ? (
                    <img src={uploadedImage} alt="Uploaded" className="uploaded-image" />
                ) : (
                    <div className="image-button" onClick={handleImageButtonClick}>
                        <img src={imageButton} alt="Upload" />
                    </div>
                )}
                {/* 숨겨진 파일 입력 요소 */}
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                />
            </div>
            <button className="ai-image-button" onClick={openModal}>
                AI 이미지 생성
            </button>

            {/* 모달 컴포넌트 */}
            <ImageCreate isOpen={isModalOpen} onClose={closeModal} />
        </div>
    );
};

export default ImageSend;
