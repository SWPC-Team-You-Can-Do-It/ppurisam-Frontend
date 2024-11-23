// src/utils/useAudioRecorder.js

import { useState, useRef } from "react";
import RecordRTC from "recordrtc";

const useAudioRecorder = (onRecordingStop) => {
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef(null);

  // 추가된 부분: 무음 감지에 필요한 레퍼런스들
  const silenceTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const isRecordingRef = useRef(false);

  const startRecording = () => {
    navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          // AudioContext 및 AnalyserNode 설정
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
          sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
          analyserRef.current = audioContextRef.current.createAnalyser();
          sourceRef.current.connect(analyserRef.current);

          // 녹음기 시작
          recorderRef.current = new RecordRTC(stream, {
            type: "audio",
            mimeType: "audio/webm", // 녹음 형식 설정
            desiredSampRate: 16000,
            numberOfAudioChannels: 1, // mono로 설정
          });
          recorderRef.current.startRecording();
          setIsRecording(true);
          isRecordingRef.current = true;

          // 무음 감지 시작
          detectSilence();
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
          isRecordingRef.current = false;

          // AudioContext 정리
          if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
            analyserRef.current = null;
            sourceRef.current = null;
          }

          // 타이머 정리
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }

          // 파일 생성
          const file = new File([blob], "recording.webm", {
            type: "audio/wabm",
          });

          // 추가된 부분: 콜백 호출
          if (onRecordingStop) {
            onRecordingStop(file);
          }

          resolve(file);
        });
      } else {
        reject(new Error("녹음이 시작되지 않았습니다."));
      }
    });
  };

  // 무음 감지 함수 추가
  const detectSilence = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const checkSilence = () => {
      analyserRef.current.getByteTimeDomainData(dataArray);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += Math.abs(dataArray[i] - 128); // 오디오 신호의 진폭 계산
      }
      const average = sum / bufferLength;

      // 임계값 이하이면 무음으로 간주
      if (average < 6) {
        // 타이머가 이미 설정되지 않았다면 타이머 시작
        if (!silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            stopRecording();
          }, 3000); // 2초 후에 녹음 종료
        }
      } else {
        // 말소리가 들리면 타이머 초기화
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      }

      if (isRecordingRef.current) {
        requestAnimationFrame(checkSilence);
      }
    };

    checkSilence();
  };

  return { isRecording, startRecording, stopRecording };
};

export default useAudioRecorder;
