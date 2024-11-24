import React, { useState } from "react";
import Header from "@/components/main/Header/Header";
import Footer from "@/components/main/Footer/Footer";
import "@/pages/SendPage/SendPage.css";
import ImageSend from "@/components/send/ImageSend/ImageSend";
import MessageSend from "@/components/send/MessageSend/MessageSend";
import SendPageContact from "@/components/send/SendPageContact/SendPageContact";
import { ImageProvider } from "@/contexts/ImageContext"; // ImageProvider 임포트

const SendPage = () => {
  // 메시지 데이터 상태
  const [messageTitle, setMessageTitle] = useState("");
  const [messageContent, setMessageContent] = useState("");

  // 핸들러 함수
  const handleMessageUpdate = (title, content) => {
    setMessageTitle(title);
    setMessageContent(content);
  };

  return (
    <div className="send-container">
      <Header />
      <ImageProvider>
        {/* ImageProvider로 감싸기 */}
        <div className="send-content-wrapper">
          <div className="send-content">
            {/* MessageSend 컴포넌트에 핸들러와 데이터 전달 */}
            <MessageSend
              onContentUpdate={handleMessageUpdate}
              messageTitle={messageTitle}
              messageContent={messageContent}
            />

            {/* ImageSend 컴포넌트에 메시지 데이터 전달 */}
            <ImageSend
              messageTitle={messageTitle}
              messageContent={messageContent}
            />
          </div>
        </div>
        <div className="send-contact-section">
          {/* SendPageContact에 메시지 데이터 전달 */}
          <SendPageContact
            messageTitle={messageTitle}
            messageContent={messageContent}
          />
        </div>
      </ImageProvider>
      <Footer />
    </div>
  );
};

export default SendPage;
