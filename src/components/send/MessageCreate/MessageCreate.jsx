// src/components/main/Send/MessageCreate/MessageCreate.jsx
import React, { useState } from 'react';
import './MessageCreate.css';
import micIcon from '@/assets/images/send/mic.png';

const MessageCreate = ({ isOpen, onClose }) => {
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
            className="message-create-modal-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="message-create-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 나가기 버튼 추가 */}
                <button
                    className="message-create-close-button"
                    onClick={onClose}
                    aria-label="나가기"
                >
                    나가기
                </button>

                <div className="message-create-modal-header">
                    <button
                        className={`message-create-toggle-button ${
                            isCreateMode ? 'active' : ''
                        }`}
                        onClick={() => {
                            if (!isCreateMode) handleToggle();
                        }}
                    >
                        메시지 생성하기
                    </button>
                    <button
                        className={`message-create-toggle-button ${
                            !isCreateMode ? 'active' : ''
                        }`}
                        onClick={() => {
                            if (isCreateMode) handleToggle();
                        }}
                    >
                        메시지 수정하기
                    </button>
                </div>

                <div className="message-create-body">
                    {/* 왼쪽 섹션 */}
                    <div className="left-section">
                        <div className="message-create-prompt-section">
                            <label className="message-create-prompt-label">
                                메시지 프롬프트 내용
                                <span className="message-create-required">*</span>
                            </label>
                            <textarea
                                className="message-create-prompt-textbox"
                                placeholder="프롬프트 할 내용을 적으시오"
                                value={prompt}
                                onChange={handlePromptChange}
                            ></textarea>
                            <div className="message-create-byte-counter">
                                {byteCount} / 200byte
                            </div>
                        </div>
                        <button className="message-create-mic-button">
                            <img src={micIcon} alt="Mic" />
                        </button>
                        <button className="message-create-generate-button">
                            메시지 생성하기
                        </button>
                    </div>

                    {/* 오른쪽 섹션 */}
                    <div className="right-section">
                        <span className="message-create-result-text">생성 결과</span>
                        <div className="message-create-image-display-box">
                            {/* 추후 이미지를 불러올 도형 영역 */}
                            {/* 현재는 플레이스홀더로 텍스트가 보입니다 */}
                        </div>
                        {/* 조건부 렌더링: 생성 모드일 때는 '삭제', 수정 모드일 때는 '되돌리기' */}
                        <button
                            className={`message-create-delete-button ${
                                !isCreateMode ? 'green-button' : ''
                            }`}
                        >
                            {isCreateMode ? '삭제' : '되돌리기'}
                        </button>
                        <button className="message-create-use-image-button">
                            이미지 사용하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageCreate;
