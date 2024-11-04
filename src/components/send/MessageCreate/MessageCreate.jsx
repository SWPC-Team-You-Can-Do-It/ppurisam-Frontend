import React, { useState } from 'react';
import './MessageCreate.css';
import micIcon from '@/assets/images/send/mic.png';
import axios from 'axios';
import useAudioRecorder from '@/utils/useAudioRecorder';

const MessageCreate = ({ isOpen, onClose, onGeneratedMessage }) => {
    const [isCreateMode, setIsCreateMode] = useState(true);
    const [prompt, setPrompt] = useState('');
    const [byteCount, setByteCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedMessage, setGeneratedMessage] = useState('');
    const { isRecording, startRecording, stopRecording } = useAudioRecorder();

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

            const message = response.data.generated_text;
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

    // 메시지 사용하기 버튼 클릭 시 콜백 호출
    const handleUseMessage = () => {
        if (onGeneratedMessage && generatedMessage) {
            onGeneratedMessage(generatedMessage); // 부모 컴포넌트로 메시지 전달
        }
    };

    if (!isOpen) return null;

    return (
        <div className="message-create-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
            <div className="message-create-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="message-create-close-button" onClick={onClose} aria-label="나가기">
                    나가기
                </button>

                <div className="message-create-modal-header">
                    <button className={`message-create-toggle-button ${isCreateMode ? 'active' : ''}`} onClick={() => !isCreateMode && setIsCreateMode(true)}>
                        메시지 생성하기
                    </button>
                    <button className={`message-create-toggle-button ${!isCreateMode ? 'active' : ''}`} onClick={() => isCreateMode && setIsCreateMode(false)}>
                        메시지 수정하기
                    </button>
                </div>

                <div className="message-create-body">
                    <div className="left-section">
                        <div className="message-create-prompt-section">
                            <label className="message-create-prompt-label">메시지 프롬프트 내용<span className="message-create-required">*</span></label>
                            <textarea className="message-create-prompt-textbox" placeholder="프롬프트 할 내용을 적으시오" value={prompt} onChange={(e) => setPrompt(e.target.value)}></textarea>
                            <div className="message-create-byte-counter">{byteCount} / 200byte</div>
                        </div>
                        <button className={`message-create-mic-button ${isRecording ? 'recording' : ''}`} onClick={isRecording ? stopRecording : startRecording} aria-label="녹음" disabled={isLoading}>
                            {isRecording ? '녹음 종료' : <img src={micIcon} alt="Mic" />}
                        </button>
                        <button className="message-create-generate-button" onClick={handleGenerateMessage} disabled={isLoading || !prompt.trim()}>
                            {isLoading ? '생성 중...' : '메시지 생성하기'}
                        </button>
                        {error && <div className="error-message">{error}</div>}
                    </div>

                    <div className="right-section">
                        <span className="message-create-result-text">생성 결과</span>
                        <div className="message-create-image-display-box">
                            {generatedMessage ? <p className="generated-message">{generatedMessage}</p> : <p className="placeholder-text">여기에 생성된 메시지가 표시됩니다.</p>}
                        </div>
                        <button className={`message-create-delete-button ${!isCreateMode ? 'green-button' : ''}`} onClick={() => setGeneratedMessage('')} disabled={!generatedMessage}>
                            {isCreateMode ? '삭제' : '되돌리기'}
                        </button>
                        <button className="message-create-use-image-button" disabled={!generatedMessage} onClick={handleUseMessage}>
                            메시지 사용하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageCreate;
