// src/components/main/Send/ImageCreate/ImageCreate.jsx
import React, { useState } from 'react';
import './ImageCreate.css';
import micIcon from '@/assets/images/send/mic.png';

const ImageCreate = ({ isOpen, onClose }) => {
    const [isCreateMode, setIsCreateMode] = useState(true);
    const [prompt, setPrompt] = useState('');
    const [byteCount, setByteCount] = useState(0);

    const handleToggle = () => {
        setIsCreateMode(!isCreateMode);
    };

    const handlePromptChange = (e) => {
        const text = e.target.value.slice(0, 200);
        setPrompt(text);
        setByteCount(text.length);
    };

    if (!isOpen) return null;

    return (
        <div
            className="image-create-modal-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="image-create-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 나가기 버튼 추가 */}
                <button
                    className="image-create-close-button"
                    onClick={onClose}
                    aria-label="나가기"
                >
                    나가기
                </button>

                <div className="image-create-modal-header">
                    <button
                        className={`image-create-toggle-button ${
                            isCreateMode ? 'active' : ''
                        }`}
                        onClick={() => {
                            if (!isCreateMode) handleToggle();
                        }}
                    >
                        이미지 생성하기
                    </button>
                    <button
                        className={`image-create-toggle-button ${
                            !isCreateMode ? 'active' : ''
                        }`}
                        onClick={() => {
                            if (isCreateMode) handleToggle();
                        }}
                    >
                        이미지 수정하기
                    </button>
                </div>

                <div className="image-create-body">
                    {/* 왼쪽 섹션 */}
                    <div className="left-section">
                        <div className="image-create-prompt-section">
                            <label className="image-create-prompt-label">
                                이미지 프롬프트 내용
                                <span className="image-create-required">*</span>
                            </label>
                            <textarea
                                className="image-create-prompt-textbox"
                                placeholder="프롬프트 할 내용을 적으시오"
                                value={prompt}
                                onChange={handlePromptChange}
                            ></textarea>
                            <div className="image-create-byte-counter">
                                {byteCount} / 200byte
                            </div>
                        </div>
                        <button className="image-create-mic-button">
                            <img src={micIcon} alt="Mic" />
                        </button>
                        <button className="image-create-generate-button">
                            이미지 생성하기
                        </button>
                    </div>

                    {/* 오른쪽 섹션 */}
                    <div className="right-section">
                        <span className="image-create-result-text">생성 결과</span>
                        <div className="image-create-image-display-box">
                            {/* 추후 이미지를 불러올 도형 영역 */}
                            {/* 현재는 플레이스홀더로 텍스트가 보입니다 */}
                        </div>
                        {/* 조건부 렌더링: 생성 모드일 때는 '삭제', 수정 모드일 때는 '되돌리기' */}
                        <button
                            className={`image-create-delete-button ${
                                !isCreateMode ? 'green-button' : ''
                            }`}
                        >
                            {isCreateMode ? '삭제' : '되돌리기'}
                        </button>
                        <button className="image-create-use-image-button">
                            이미지사용하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCreate;
