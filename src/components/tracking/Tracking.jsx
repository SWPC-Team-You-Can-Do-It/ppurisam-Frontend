// src/components/tracking/Tracking.jsx

import React, { useState, useEffect } from "react";
import "./Tracking.css";
import PolygonIcon from "@/assets/images/tracking/Polygon.png";
import axiosInstance from "../login/axiosInstance"; // Axios 인스턴스 import

const Tracking = () => {
  // 상태 관리
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState(null); // 확장된 행의 글로벌 인덱스
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 창 표시 여부
  const [selectedRecipients, setSelectedRecipients] = useState([]); // 선택된 수신자 목록

  const [messages, setMessages] = useState([]); // 현재 페이지의 메시지 목록
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

  // 메시지 데이터를 API로부터 가져오는 함수
  const fetchMessages = async (page) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/api/message", {
        params: { page: page - 1 }, // API는 0부터 페이지 번호 시작
      });

      // 콘솔 로그로 응답 데이터 확인 (디버깅용)
      console.log("API Response:", response.data);

      // total_pages가 유효한 숫자인지 확인하고 최소 1로 설정
      const fetchedTotalPages = Number(response.data.total_pages);
      const fetchedTotalElements = Number(response.data.total_elements);
      console.log(`Fetched Total Pages: ${fetchedTotalPages}`);
      console.log(`Fetched Total Elements: ${fetchedTotalElements}`);

      setTotalPages(
        !isNaN(fetchedTotalPages) && fetchedTotalPages > 0
          ? fetchedTotalPages
          : 1
      );

      setMessages(response.data.messages);
    } catch (err) {
      console.error("메시지 조회 오류:", err);
      setError("메시지 조회 중 오류가 발생했습니다.");
      setMessages([]);
      setTotalPages(1); // 에러 발생 시 totalPages를 1로 설정
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트가 마운트되거나 currentPage가 변경될 때마다 메시지 데이터를 가져옵니다.
  useEffect(() => {
    console.log(`Current Page: ${currentPage}, Total Pages: ${totalPages}`);
    fetchMessages(currentPage);
  }, [currentPage]); // 의존성을 currentPage로만 설정

  // 검색어를 기준으로 메시지 필터링
  const filteredData = messages.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 이미 페이지네이션된 데이터이므로 추가 슬라이싱 불필요
  const paginatedData = filteredData;

  // 검색어 변경 핸들러
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // 검색 시 페이지 초기화
    setExpandedRow(null); // 검색 시 확장된 행 초기화
    closeModal(); // 검색 시 모달 닫기
  };

  // 검색어 초기화 핸들러
  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    setExpandedRow(null);
    closeModal();
  };

  // 이전 페이지로 이동하는 핸들러
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    setExpandedRow(null);
    closeModal();
  };

  // 다음 페이지로 이동하는 핸들러
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    setExpandedRow(null);
    closeModal();
  };

  // 특정 페이지로 이동하는 핸들러
  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
    setExpandedRow(null);
    closeModal();
  };

  // 행 확장/축소 핸들러
  const toggleExpandRow = (index) => {
    setExpandedRow((prevIndex) => (prevIndex === index ? null : index));
    closeModal();
  };

  // 모달 열기 핸들러
  const openModal = (recipients) => {
    setSelectedRecipients(recipients);
    setIsModalOpen(true);
  };

  // 모달 닫기 핸들러
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRecipients([]);
  };

  // 이미지 URL 변환 함수
  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/150";
    // Check if the URL is absolute
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    } else {
      return `${BACKEND_BASE_URL}${url}`;
    }
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
          {isLoading ? (
            <div className="loading">로딩 중...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : paginatedData.length > 0 ? (
            paginatedData.map((item, index) => {
              const globalIndex = (currentPage - 1) * 6 + index; // itemsPerPage=6을 기준으로 글로벌 인덱스 계산
              const isExpanded = expandedRow === globalIndex;
              const imageUrl = getImageUrl(
                item.images && item.images.length > 0 ? item.images[0].url : null
              );

              return (
                <React.Fragment key={item.id || globalIndex}>
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
                    <div className={`table-column status ${item.status ? "completed" : "failed"}`}>
                      {item.status ? "전송 완료" : "전송 실패"}
                    </div>
                    <div className="table-column date">
                      {item.send_at
                        ? new Date(item.send_at).toLocaleDateString()
                        : "N/A"}
                    </div>
                    <div className="table-column details">
                      <img
                        src={PolygonIcon}
                        alt="세부사항 아이콘"
                        className={`detail-icon ${isExpanded ? "rotated" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation(); // 행 클릭 이벤트 방지
                          toggleExpandRow(globalIndex);
                        }}
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
                              src={imageUrl}
                              alt={`${item.title} 이미지`}
                              onError={(e) => {
                                console.error(`이미지 로딩 실패: ${imageUrl}`);
                                e.target.src = "https://via.placeholder.com/150"; // 로딩 실패 시 대체 이미지
                              }}
                              loading="lazy" // Lazy Loading 적용
                            />
                          </div>
                          <div className="sender-section">
                            <strong>발신번호:</strong>{" "}
                            <span className="sender-number">
                              {item.from_phone_number}
                            </span>
                          </div>
                          <div className="recipients-section">
                            <button
                              className="recipients-button"
                              onClick={(e) => {
                                e.stopPropagation(); // 행 클릭 이벤트 방지
                                openModal(item.receivers);
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
              key={index + 1} // 페이지 번호를 키로 사용
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
                  {recipient.name}: {recipient.phone_number}
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
