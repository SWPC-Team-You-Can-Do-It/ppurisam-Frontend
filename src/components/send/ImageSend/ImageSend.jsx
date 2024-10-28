// src/components/main/Send/ImageSend/ImageSend.jsx
import React from 'react';
import './ImageSend.css';
import imageButton from '@/assets/images/send/imagebutton.png';

const ImageSend = () => {
    return (
        <div className="image-send-container">
            <h2 className="image-send-title">이미지 첨부</h2>
            <div className="image-upload-box">
                <div className="image-button">
                    <img src={imageButton} alt="Upload" />
                </div>
            </div>
            <button className="ai-image-button">AI 이미지 생성</button>
        </div>
    );
};

export default ImageSend;