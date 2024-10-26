// src/components/main/Send/MessageSend/MessageSend.jsx
import React from 'react';
import './MessageSend.css';
import micIcon from '@/assets/images/send/mic.png';

const MessageSend = () => {
    return (
        <div className="message-send-container">
            <h2 className="message-send-title">메시지 입력</h2>
            <div className="search-input-box">
                <input type="text" className="search-input" placeholder="내용을 입력해주세요." />
                <button className="mic-button"></button>
            </div>
            <textarea className="large-message-box" placeholder="내용을 입력해주세요. 90byte 초과 시 장문 문자로, 이미지 추가 시 포토 문자로 자동 전환 됩니다."></textarea>
            <div className="action-buttons">
                <button className="action-button">AI 자동 생성</button>
                <button className="mic-button2" id="mic-button-large">
                    <img src={micIcon} alt="Mic Icon" className="mic-icon" />
                </button>
            </div>
            <button className="submit-button">작성 완료</button>
        </div>
    );
};

export default MessageSend;
