import React, { useState } from "react";
import "./MessageSend.css";
import micIcon from "@/assets/images/send/mic.png";
import MessageCreate from "../MessageCreate/MessageCreate";
import useAudioRecorder from "@/utils/useAudioRecorder";
import axiosInstance from "../../login/axiosInstance";

const MessageSend = ({ onGeneratedMessage }) => {
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [textareaText, setTextareaText] = useState("");
  const [error, setError] = useState("");

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

  const openMessageModal = () => setIsMessageModalOpen(true);
  const closeMessageModal = () => setIsMessageModalOpen(false);

  // 오디오 파일을 서버로 전송하고 텍스트를 설정하는 함수
  const handleAudioAvailable = async (file, target) => {
    const formData = new FormData();
    formData.append("file", file, file.name);

    try {
      const response = await axiosInstance.post(`/api/stt`, formData);
      const transcription = response.data.text;

      if (target === "input") {
        setInputText(transcription);
      } else if (target === "textarea") {
        setTextareaText(transcription);
      }
    } catch (err) {
      console.error("파일 전송 오류:", err);
      if (err.response) {
        setError(
          `서버 오류: ${err.response.data.message || "알 수 없는 오류"}`
        );
      } else if (err.request) {
        setError("서버에 응답이 없습니다. 네트워크 상태를 확인해주세요.");
      } else {
        setError(`오류 발생: ${err.message}`);
      }
    }
  };

  // Input 필드용 마이크 버튼 핸들러
  const handleMicInputClick = async () => {
    if (isRecordingInput) {
      try {
        const file = await stopRecordingInput();
        if (file) {
          await handleAudioAvailable(file, "input");
        } else {
          setError("녹음된 파일이 없습니다.");
        }
      } catch (err) {
        console.error("녹음 중지 오류:", err);
        setError("녹음을 처리하는 중 오류가 발생했습니다.");
      }
    } else {
      startRecordingInput();
    }
  };

  // Textarea 필드용 마이크 버튼 핸들러
  const handleMicTextareaClick = async () => {
    if (isRecordingTextarea) {
      try {
        const file = await stopRecordingTextarea();
        if (file) {
          await handleAudioAvailable(file, "textarea");
        } else {
          setError("녹음된 파일이 없습니다.");
        }
      } catch (err) {
        console.error("녹음 중지 오류:", err);
        setError("녹음을 처리하는 중 오류가 발생했습니다.");
      }
    } else {
      startRecordingTextarea();
    }
  };

  // 메시지 생성 완료 시 호출될 콜백 함수 정의
  const handleGeneratedMessage = (message) => {
    console.log("Generated Message:", message);
    setTextareaText(message); // 생성된 메시지를 textarea에 설정
    onGeneratedMessage(message); // 생성된 프롬프트 상태 업데이트
    closeMessageModal(); // MessageCreate 모달 닫기
  };

  return (
    <div className="message-send-container">
      <h2 className="message-send-title">메시지 입력</h2>
      <div className="search-input-box">
        <input
          type="text"
          className="search-input"
          placeholder="제목을 입력해주세요."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button
          className={`mic-button ${isRecordingInput ? "recording" : ""}`}
          onClick={handleMicInputClick}
          aria-label="녹음"
          disabled={isMessageModalOpen} // 모달이 열려있을 때 비활성화
        >
          {isRecordingInput ? (
            "녹음 종료"
          ) : (
            <img src={micIcon} alt="Mic Icon" />
          )}
        </button>
      </div>
      <textarea
        className="large-message-box"
        placeholder="내용을 입력해주세요."
        value={textareaText}
        onChange={(e) => setTextareaText(e.target.value)}
      ></textarea>
      <div className="action-buttons">
        <button className="action-button" onClick={openMessageModal}>
          AI 자동 생성
        </button>
        <button
          className={`mic-button2 ${isRecordingTextarea ? "recording" : ""}`}
          onClick={handleMicTextareaClick}
          aria-label="녹음"
          disabled={isMessageModalOpen} // 모달이 열려있을 때 비활성화
        >
          {isRecordingTextarea ? (
            "녹음 종료"
          ) : (
            <img src={micIcon} alt="Mic Icon" className="mic-icon" />
          )}
        </button>
      </div>
      <button
        className="submit-button1"
        onClick={() =>
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
          })
        }
        disabled={isMessageModalOpen} // 모달이 열려있을 때 비활성화
      >
        작성 완료
      </button>

      {error && <div className="error-message">{error}</div>}

      {/* 모달 컴포넌트, onGeneratedMessage 콜백 전달 */}
      <MessageCreate
        isOpen={isMessageModalOpen}
        onClose={closeMessageModal}
        onGeneratedMessage={handleGeneratedMessage}
        prompt={inputText || textareaText} // 전달된 텍스트를 prompt로 설정
      />
    </div>
  );
};

export default MessageSend;
