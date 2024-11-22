// src/pages/SendPage/SendPage.jsx

import React, { useState, useRef } from "react";
import Header from "@/components/main/Header/Header";
import Footer from "@/components/main/Footer/Footer";
import "@/pages/SendPage/SendPage.css";
import ImageSend from "@/components/send/ImageSend/ImageSend";
import MessageSend from "@/components/send/MessageSend/MessageSend";
import SendPageContact from "@/components/send/SendPageContact/SendPageContact";
import { ImageProvider } from "@/contexts/ImageContext"; // ImageProvider 임포트
import html2canvas from "html2canvas";

const SendPage = () => {
  // 메시지 데이터 상태
  const [messageTitle, setMessageTitle] = useState("");
  const [messageContent, setMessageContent] = useState("");

  // SendPageContact로 스크롤하기 위한 ref 생성
  const sendPageContactRef = useRef(null);

  // 캡처 대상 영역에 대한 ref
  const sendContentRef = useRef(null);

  // 핸들러 함수
  const handleMessageUpdate = (title, content) => {
    setMessageTitle(title);
    setMessageContent(content);
  };

  // 작성 완료 버튼 클릭 시 SendPageContact로 스크롤하고 이미지 저장
  const handleComplete = async () => {
    // 1. SendPageContact로 스크롤
    if (sendPageContactRef.current) {
      sendPageContactRef.current.scrollIntoView({ behavior: "smooth" });
    }

    // 2. 이미지 및 텍스트 합성 및 저장
    if (sendContentRef.current) {
      try {
        const canvas = await html2canvas(sendContentRef.current, {
          useCORS: true, // CORS 문제 해결
          scale: 2, // 이미지 해상도 향상
        });
        const imgData = canvas.toDataURL("image/png");

        // 다운로드 링크 생성
        const link = document.createElement("a");
        link.href = imgData;
        link.download = "composed_image.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("이미지 저장 중 오류 발생:", error);
        alert("이미지를 저장하는 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="send-container">
      <Header />
      <ImageProvider>
        {/* ImageProvider로 감싸기 */}
        <div className="send-content-wrapper" ref={sendContentRef}>
          <div className="send-content">
            {/* MessageSend 컴포넌트에 핸들러와 데이터 전달 */}
            <MessageSend
              onContentUpdate={handleMessageUpdate}
              messageTitle={messageTitle}
              messageContent={messageContent}
              onComplete={handleComplete} // 작성 완료 버튼 클릭 시 호출될 함수 전달
            />

            {/* ImageSend 컴포넌트에 메시지 데이터 전달 */}
            <ImageSend
              messageTitle={messageTitle}
              messageContent={messageContent}
            />
          </div>
        </div>
        <div className="send-contact-section">
          {/* SendPageContact에 메시지 데이터 전달 및 ref 연결 */}
          <SendPageContact
            messageTitle={messageTitle}
            messageContent={messageContent}
            ref={sendPageContactRef} // ref 연결
          />
        </div>
      </ImageProvider>
      <Footer />
    </div>
  );
};

export default SendPage;
