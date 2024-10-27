// src/components/tracking/Tracking.js

import React, { useState } from "react";
import "./Tracking.css";
import PolygonIcon from "@/assets/images/tracking/Polygon.png";
import TrackData from "./TrackData";

const Tracking = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState(null); // 확장된 행의 글로벌 인덱스
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 창 표시 여부
  const [selectedRecipients, setSelectedRecipients] = useState([]); // 선택된 수신자 목록

  // 불러온 데이터를 사용
  const data = TrackData;

  const filteredData = data.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 6; // 한 페이지에 표시할 아이템 수
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // 검색 시 페이지 초기화
    setExpandedRow(null); // 검색 시 확장된 행 초기화
    closeModal(); // 검색 시 모달 닫기
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    setExpandedRow(null);
    closeModal();
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    setExpandedRow(null);
    closeModal();
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    setExpandedRow(null);
    closeModal();
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
    setExpandedRow(null);
    closeModal();
  };

  const toggleExpandRow = (index) => {
    setExpandedRow((prevIndex) => (prevIndex === index ? null : index));
    closeModal();
  };

  const openModal = (recipients) => {
    setSelectedRecipients(recipients);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRecipients([]);
  };

  return (
    <div className="tracking-content-wrapper">
      {/* 발송 조회 및 검색 섹션 */}
      <div className="header-section">
        <div className="header-title">발송조회</div>
        <div className="search-bar">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={searchTerm}
            onChange={handleSearch}
          />
          {searchTerm && (
            <button
              className="clear-button"
              onClick={handleClearSearch}
              aria-label="검색어 지우기"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* 테이블 섹션 */}
      <div className="table-container">
        {/* 테이블 헤더 */}
        <div className="table-header">
          <div className="table-column title">제목</div>
          <div className="table-column status">상태</div>
          <div className="table-column date">전송일</div>
          <div className="table-column details">세부사항</div>
        </div>

        {/* 테이블 바디 */}
        <div className="table-body">
          {paginatedData.length > 0 ? (
            paginatedData.map((item, index) => {
              const globalIndex = (currentPage - 1) * itemsPerPage + index;
              const isExpanded = expandedRow === globalIndex;
              return (
                <React.Fragment key={globalIndex}>
                  <div
                    className={`table-row ${isExpanded ? "expanded" : ""}`}
                    onClick={() => toggleExpandRow(globalIndex)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        toggleExpandRow(globalIndex);
                      }
                    }}
                    aria-expanded={isExpanded}
                  >
                    <div className="table-column title">{item.title}</div>
                    <div className={`table-column status ${item.status}`}>
                      {item.status === "completed" ? "전송 완료" : "전송 실패"}
                    </div>
                    <div className="table-column date">{item.date}</div>
                    <div className="table-column details">
                      <img
                        src={PolygonIcon}
                        alt="세부사항 아이콘"
                        className={`detail-icon ${isExpanded ? "rotated" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation(); // 행 클릭 이벤트 방지
                          toggleExpandRow(globalIndex);
                        }} // 클릭 시 상세 내용 토글
                        title="세부사항 보기"
                      />
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="expanded-row">
                      <div className="expanded-content">
                        <div className="left-section">
                          <p>{item.content}</p>
                        </div>
                        <div className="right-section">
                          <div className="image-section">
                            <img
                              src={item.imageUrl}
                              alt={`${item.title} 이미지`}
                            />
                          </div>
                          <div className="sender-section">
                            <strong>발신번호:</strong>{" "}
                            <span className="sender-number">
                              {item.senderNumber}
                            </span>
                          </div>
                          <div className="recipients-section">
                            <button
                              className="recipients-button"
                              onClick={(e) => {
                                e.stopPropagation(); // 행 클릭 이벤트 방지
                                openModal(item.recipients);
                              }}
                              aria-haspopup="dialog"
                              aria-controls={`recipients-modal-${globalIndex}`}
                            >
                              수신자 목록
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })
          ) : (
            <div className="no-data">검색 결과가 없습니다.</div>
          )}
        </div>

        {/* 테이블 페이징 */}
        <div className="table-pagination">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="pagination-button"
            aria-label="이전 페이지"
          >
            이전
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <span
              key={index}
              onClick={() => handlePageClick(index + 1)}
              className={
                currentPage === index + 1 ? "active-page" : "pagination-page"
              }
            >
              {index + 1}
            </span>
          ))}
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="pagination-button"
            aria-label="다음 페이지"
          >
            다음
          </button>
        </div>
      </div>

      {/* 모달 창 */}
      {isModalOpen && (
        <div
          className="modal-overlay"
          onClick={closeModal}
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // 모달 내용 클릭 시 닫히지 않도록 방지
          >
            <button
              className="modal-close-button"
              onClick={closeModal}
              aria-label="모달 닫기"
            >
              &times;
            </button>
            <h2 id="modal-title">수신자 목록</h2>
            <ul className="modal-recipients-list">
              {selectedRecipients.map((recipient, idx) => (
                <li key={idx}>
                  {recipient.name}: {recipient.phone}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tracking;
