// src/components/main/Send/ImageCreate/ImageCreate.jsx
import React, { useState } from 'react';
import './ImageCreate.css';
import micIcon from '@/assets/images/send/mic.png';
import axios from 'axios';

const ImageCreate = ({ isOpen, onClose, onImageGenerated }) => { // onImageGenerated prop 추가
    const [isCreateMode, setIsCreateMode] = useState(true);
    const [prompt, setPrompt] = useState('');
    const [byteCount, setByteCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageUrl, setImageUrl] = useState(null); // 이미지 URL 상태 추가

    const handleToggle = () => {
        setIsCreateMode(!isCreateMode);
    };

    const handlePromptChange = (e) => {
        const text = e.target.value.slice(0, 200);
        setPrompt(text);
        setByteCount(text.length);
    };

    const handleGenerateImage = async () => {
        if (!prompt.trim()) {
            setError('프롬프트를 입력해주세요.');
            return;
        }

        console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL); // 디버깅 로그

        setIsLoading(true);
        setError('');
        setImageUrl(null); // 이미지 초기화

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/image-ai`, // 올바른 엔드포인트로 수정
                { prompt }
            );

            // 백엔드에서 반환된 URL 문자열을 직접 사용
            const imageUrl = response.data;
            console.log('Generated Image URL:', imageUrl); // 추가 디버깅 로그

            if (imageUrl) {
                setImageUrl(imageUrl); // 로컬 상태에 이미지 URL 저장
                // onClose(); // 이미지 생성 후 모달을 닫고 싶지 않다면 주석 처리
            } else {
                setError('이미지 생성에 실패했습니다.');
            }
        } catch (err) {
            console.error('Axios Error:', err);
            setError('이미지 생성 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
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
                        className={`image-create-toggle-button ${isCreateMode ? 'active' : ''}`}
                        onClick={() => {
                            if (!isCreateMode) handleToggle();
                        }}
                    >
                        이미지 생성하기
                    </button>
                    <button
                        className={`image-create-toggle-button ${!isCreateMode ? 'active' : ''}`}
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
                        <button
                            className="image-create-generate-button"
                            onClick={handleGenerateImage}
                            disabled={isLoading} // 로딩 상태에 따라 버튼 비활성화
                        >
                            {isLoading ? '생성 중...' : '이미지 생성하기'}
                        </button>
                        {error && <div className="error-message">{error}</div>} {/* 에러 메시지 표시 */}
                    </div>

                    {/* 오른쪽 섹션 */}
                    <div className="right-section">
                        <span className="image-create-result-text">생성 결과</span>
                        <div className="image-create-image-display-box">
                            {imageUrl && (
                                <img src={imageUrl} alt="Generated" className="generated-image" />
                            )}
                        </div>
                        {/* 조건부 렌더링: 생성 모드일 때는 '삭제', 수정 모드일 때는 '되돌리기' */}
                        <button
                            className={`image-create-delete-button ${!isCreateMode ? 'green-button' : ''}`}
                            onClick={() => {
                                if (isCreateMode) {
                                    setImageUrl(null); // 이미지 삭제
                                } else {
                                    handleToggle(); // 이미지 수정 모드로 전환
                                }
                            }}
                        >
                            {isCreateMode ? '삭제' : '되돌리기'}
                        </button>
                        <button
                            className="image-create-use-image-button"
                            onClick={() => {
                                if (onImageGenerated && imageUrl) {
                                    onImageGenerated(imageUrl); // 이미지 사용하기 버튼 클릭 시 호출
                                }
                            }}
                            disabled={!imageUrl} // 이미지가 없으면 버튼 비활성화
                        >
                            이미지사용하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCreate;
