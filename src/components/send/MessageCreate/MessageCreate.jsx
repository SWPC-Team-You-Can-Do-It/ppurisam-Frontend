// src/components/main/Send/MessageCreate/MessageCreate.jsx

import React, { useState } from 'react';
import './MessageCreate.css';
import micIcon from '@/assets/images/send/mic.png';
import axios from 'axios';
import useAudioRecorder from '@/utils/useAudioRecorder'; // 음성 녹음 훅 임포트

const MessageCreate = ({ isOpen, onClose }) => {
    const [isCreateMode, setIsCreateMode] = useState(true);
    const [prompt, setPrompt] = useState('');
    const [byteCount, setByteCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
    const [error, setError] = useState(''); // 에러 상태 추가
    const [generatedMessage, setGeneratedMessage] = useState(''); // 생성된 메시지 상태 추가
    const { isRecording, startRecording, stopRecording } = useAudioRecorder(); // 음성 녹음 훅 사용

    const handleToggle = () => {
        setIsCreateMode(!isCreateMode);
    };

    const handlePromptChange = (e) => {
        const text = e.target.value.slice(0, 200);
        setPrompt(text);
        // UTF-8 기준으로 바이트 수 계산
        const byteLength = new Blob([text]).size;
        setByteCount(byteLength);
    };

    // 마이크 버튼 클릭 시 음성 녹음 처리 함수
    const handleMicClick = async () => {
        if (isRecording) {
            try {
                const file = await stopRecording();
                if (file) {
                    await handleAudioAvailable(file);
                }
            } catch (err) {
                console.error('녹음 중지 오류:', err);
                setError('녹음을 처리하는 중 오류가 발생했습니다.');
            }
        } else {
            startRecording();
        }
    };

    // 음성 파일을 서버로 전송하여 텍스트로 변환하는 함수
    const handleAudioAvailable = async (file) => {
        const formData = new FormData();
        formData.append('file', file, file.name);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/stt`,
                formData
            );

            const transcription = response.data.text;
            setPrompt(transcription);
            // UTF-8 기준으로 바이트 수 계산
            const byteLength = new Blob([transcription]).size;
            setByteCount(byteLength);
        } catch (err) {
            console.error('파일 전송 오류:', err);
            if (err.response) {
                setError(`서버 오류: ${err.response.data.message || '알 수 없는 오류'}`);
            } else if (err.request) {
                setError('서버에 응답이 없습니다. 네트워크 상태를 확인해주세요.');
            } else {
                setError(`오류 발생: ${err.message}`);
            }
        }
    };

    // 메시지 생성하기 버튼 클릭 시 API 호출 함수
    const handleGenerateMessage = async () => {
        if (!prompt.trim()) {
            setError('프롬프트를 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setError('');
        setGeneratedMessage('');

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/text-ai`,
                { text: prompt }
            );

            const message = response.data.text;
            if (message) {
                setGeneratedMessage(message);
            } else {
                setError('메시지 생성에 실패했습니다.');
            }
        } catch (err) {
            console.error('메시지 생성 오류:', err);
            setError('메시지 생성 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
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
                {/* 나가기 버튼 */}
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
                        {/* 마이크 버튼 */}
                        <button
                            className={`message-create-mic-button ${isRecording ? 'recording' : ''}`}
                            onClick={handleMicClick}
                            aria-label="녹음"
                            disabled={isLoading}
                        >
                            {isRecording ? '녹음 종료' : <img src={micIcon} alt="Mic" />}
                        </button>
                        {/* 메시지 생성하기 버튼 */}
                        <button
                            className="message-create-generate-button"
                            onClick={handleGenerateMessage}
                            disabled={isLoading || !prompt.trim()}
                        >
                            {isLoading ? '생성 중...' : '메시지 생성하기'}
                        </button>
                        {/* 에러 메시지 */}
                        {error && <div className="error-message">{error}</div>}
                    </div>

                    {/* 오른쪽 섹션 */}
                    <div className="right-section">
                        <span className="message-create-result-text">생성 결과</span>
                        <div className="message-create-image-display-box">
                            {generatedMessage ? (
                                <p className="generated-message">{generatedMessage}</p>
                            ) : (
                                <p className="placeholder-text">여기에 생성된 메시지가 표시됩니다.</p>
                            )}
                        </div>
                        {/* 조건부 렌더링: 생성 모드일 때는 '삭제', 수정 모드일 때는 '되돌리기' */}
                        <button
                            className={`message-create-delete-button ${
                                !isCreateMode ? 'green-button' : ''
                            }`}
                            onClick={() => {
                                if (isCreateMode) {
                                    setGeneratedMessage('');
                                } else {
                                    // 수정 모드일 때 동작 (필요한 경우)
                                }
                            }}
                            disabled={!generatedMessage}
                        >
                            {isCreateMode ? '삭제' : '되돌리기'}
                        </button>
                        <button
                            className="message-create-use-image-button"
                            disabled={!generatedMessage}
                            onClick={() => {
                                // 생성된 메시지 사용하기 로직 추가 (필요한 경우)
                            }}
                        >
                            메시지 사용하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageCreate;
