// src/components/tracking/Tracking.jsx

import React, { useState, useEffect, useMemo } from "react";
import "./Tracking.css";
import PolygonIcon from "@/assets/images/tracking/Polygon.png";
import axiosInstance from "../login/axiosInstance"; // Axios 인스턴스 import

const ITEMS_PER_PAGE = 6; // 페이지당 표시할 아이템 수

const Tracking = () => {
  // 상태 관리
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState(null); // 확장된 행의 글로벌 인덱스
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 창 표시 여부
  const [selectedRecipients, setSelectedRecipients] = useState([]); // 선택된 수신자 목록

  const [allMessages, setAllMessages] = useState([]); // 모든 메시지 목록
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

  // 메시지 데이터를 API로부터 가져오는 함수
  const fetchAllMessages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let page = 0;
      let fetchedMessages = [];
      let totalPages = 1; // 초기값 설정

      while (page < totalPages) {
        const response = await axiosInstance.get("/api/message", {
          params: { page, page_size: 100 }, // 한 번에 많은 데이터를 가져오기 위해 page_size를 크게 설정
        });

        console.log("API Response:", response.data);

        fetchedMessages = [...fetchedMessages, ...response.data.messages];
        totalPages = Number(response.data.total_pages);
        page += 1;
      }

      setAllMessages(fetchedMessages);
    } catch (err) {
      console.error("메시지 조회 오류:", err);
      setError("메시지 조회 중 오류가 발생했습니다.");
      setAllMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트가 마운트될 때 모든 메시지를 가져옵니다.
  useEffect(() => {
    fetchAllMessages();
  }, []);

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

  // 검색어에 따라 필터링된 메시지 목록을 계산합니다.
  const filteredMessages = useMemo(() => {
    if (!searchTerm.trim()) return allMessages;

    const lowercasedTerm = searchTerm.toLowerCase();

    return allMessages.filter((message) => {
      const titleMatch = message.title.toLowerCase().includes(lowercasedTerm);
      const contentMatch = message.content.toLowerCase().includes(lowercasedTerm);
      const phoneMatch = message.receivers.some((receiver) =>
          receiver.phone_number.includes(searchTerm)
      );
      return titleMatch || contentMatch || phoneMatch;
    });
  }, [allMessages, searchTerm]);

  // 현재 페이지에 표시할 메시지 목록을 계산합니다.
  const paginatedMessages = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredMessages.slice(startIndex, endIndex);
  }, [filteredMessages, currentPage]);

  // 총 페이지 수를 계산합니다.
  const totalPages = Math.ceil(filteredMessages.length / ITEMS_PER_PAGE) || 1;

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
            ) : paginatedMessages.length > 0 ? (
                paginatedMessages.map((item, index) => {
                  const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index; // 글로벌 인덱스 계산
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
                          <div
                              className={`table-column status ${
                                  item.status ? "completed" : "failed"
                              }`}
                          >
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
                                  {/* info-section 추가 */}
                                  <div className="info-section">
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
