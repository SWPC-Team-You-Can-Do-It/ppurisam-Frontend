// src/utils/useAudioRecorder.js

import { useState, useRef } from "react";
import RecordRTC from "recordrtc";

const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef(null);

  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        recorderRef.current = new RecordRTC(stream, {
          type: "audio",
          mimeType: "audio/webm", // 녹음 형식 설정
          desiredSampRate: 16000,
          numberOfAudioChannels: 1, // mono로 설정
        });
        recorderRef.current.startRecording();
        setIsRecording(true);
      })
      .catch((err) => {
        console.error("getUserMedia error:", err);
        alert("녹음을 시작할 수 없습니다. 마이크 접근 권한을 확인해주세요.");
      });
  };

  const stopRecording = () => {
    return new Promise((resolve, reject) => {
      if (recorderRef.current) {
        recorderRef.current.stopRecording(() => {
          const blob = recorderRef.current.getBlob();
          console.log("녹음된 Blob:", blob); // Blob 정보 출력
          recorderRef.current.destroy();
          recorderRef.current = null;
          setIsRecording(false);

          // 파일 이름을 실제 형식에 맞게 변경
          const file = new File([blob], "recording.webm", {
            type: "audio/webm",
          });
          resolve(file);
        });
      } else {
        reject(new Error("녹음이 시작되지 않았습니다."));
      }
    });
  };

  return { isRecording, startRecording, stopRecording };
};

export default useAudioRecorder;
