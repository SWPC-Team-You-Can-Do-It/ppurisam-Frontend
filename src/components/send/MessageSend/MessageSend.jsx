// src/components/main/Send/MessageSend/MessageSend.jsx

import React, { useState } from 'react';
import './MessageSend.css';
import micIcon from '@/assets/images/send/mic.png';
import MessageCreate from '../MessageCreate/MessageCreate';
import axios from 'axios';
import useAudioRecorder from '@/utils/useAudioRecorder'; // 커스텀 훅 임포트

const MessageSend = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inputText, setInputText] = useState(''); // input 필드의 텍스트 상태
    const [textareaText, setTextareaText] = useState(''); // textarea 필드의 텍스트 상태
    const [error, setError] = useState(''); // 에러 메시지 상태

    // 각 마이크 버튼에 대한 녹음 상태를 별도로 관리
    const {
        isRecording: isRecordingInput,
        startRecording: startRecordingInput,
        stopRecording: stopRecordingInput,
    } = useAudioRecorder();

    const {
        isRecording: isRecordingTextarea,
        startRecording: startRecordingTextarea,
        stopRecording: stopRecordingTextarea,
    } = useAudioRecorder();

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleScrollToBottom = () => {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
        });
    };

    // 녹음된 오디오를 처리하는 함수 (input 필드용)
    const handleAudioAvailableInput = async (file) => {
        const formData = new FormData();
        formData.append('file', file, file.name);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/stt`,
                formData
            );

            const transcription = response.data.text;
            setInputText(transcription);
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

    // 녹음된 오디오를 처리하는 함수 (textarea 필드용)
    const handleAudioAvailableTextarea = async (file) => {
        const formData = new FormData();
        formData.append('file', file, file.name);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/stt`,
                formData
            );

            const transcription = response.data.text;
            setTextareaText(transcription);
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

    // 마이크 버튼 클릭 시 녹음 시작/중지 처리 (input 필드용)
    const handleMicClickInput = async () => {
        if (isRecordingInput) {
            try {
                const file = await stopRecordingInput();
                if (file) {
                    await handleAudioAvailableInput(file);
                }
            } catch (err) {
                console.error('녹음 중지 오류:', err);
                setError('녹음을 처리하는 중 오류가 발생했습니다.');
            }
        } else {
            startRecordingInput();
        }
    };

    // 마이크 버튼 클릭 시 녹음 시작/중지 처리 (textarea 필드용)
    const handleMicClickTextarea = async () => {
        if (isRecordingTextarea) {
            try {
                const file = await stopRecordingTextarea();
                if (file) {
                    await handleAudioAvailableTextarea(file);
                }
            } catch (err) {
                console.error('녹음 중지 오류:', err);
                setError('녹음을 처리하는 중 오류가 발생했습니다.');
            }
        } else {
            startRecordingTextarea();
        }
    };

    return (
        <div className="message-send-container">
            <h2 className="message-send-title">메시지 입력</h2>
            <div className="search-input-box">
                <input
                    type="text"
                    className="search-input"
                    placeholder="내용을 입력해주세요."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />
                <button
                    className={`mic-button ${isRecordingInput ? 'recording' : ''}`}
                    onClick={handleMicClickInput}
                    aria-label="녹음"
                >
                    {isRecordingInput ? '녹음 종료' : <img src={micIcon} alt="Mic Icon" />}
                </button>
            </div>
            <textarea
                className="large-message-box"
                placeholder="내용을 입력해주세요. 90byte 초과 시 장문 문자로, 이미지 추가 시 포토 문자로 자동 전환 됩니다."
                value={textareaText}
                onChange={(e) => setTextareaText(e.target.value)}
            ></textarea>
            <div className="action-buttons">
                <button className="action-button" onClick={openModal}>AI 자동 생성</button>
                <button
                    className={`mic-button2 ${isRecordingTextarea ? 'recording' : ''}`}
                    id="mic-button-large"
                    onClick={handleMicClickTextarea}
                    aria-label="녹음"
                >
                    {isRecordingTextarea ? '녹음 종료' : <img src={micIcon} alt="Mic Icon" className="mic-icon" />}
                </button>
            </div>
            <button className="submit-button1" onClick={handleScrollToBottom}>작성 완료</button>

            {/* 에러 메시지 표시 */}
            {error && <div className="error-message">{error}</div>}

            {/* 모달 컴포넌트 */}
            <MessageCreate isOpen={isModalOpen} onClose={closeModal} />
        </div>
    );
};

export default MessageSend;
