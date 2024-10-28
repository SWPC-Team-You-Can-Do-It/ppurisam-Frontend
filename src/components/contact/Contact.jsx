//Contact.jsx
import React, { useState } from 'react';
import './Contact.css';
import penIcon from '@/assets/images/contact/Pen.png'; // 수정 아이콘
import trashIcon from '@/assets/images/contact/trash.png'; // 삭제 아이콘
import arrowIcon from '@/assets/images/contact/icon_arrow.png'; // 폴더 정렬 화살표 아이콘
import folderIcon from '@/assets/images/contact/folder.png'; // 폴더 추가 아이콘
import uploadIcon from '@/assets/images/contact/Upload.png'; // 엑셀 업로드 아이콘

const Contact = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isFolderDropdownOpen, setIsFolderDropdownOpen] = useState(false);
    const [currentTab, setCurrentTab] = useState('manage'); // 기본 디폴트 화면을 주소록 관리로 설정
    const [checkedContacts, setCheckedContacts] = useState([]); // 체크된 연락처 목록 관리
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호 상태 설정

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const toggleFolderDropdown = () => {
        setIsFolderDropdownOpen(!isFolderDropdownOpen);
    };

    const contactsPerPage = 6; // 페이지당 연락처 수
    const totalContacts = 18; // 전체 연락처 수 (예시)
    const totalPages = Math.ceil(totalContacts / contactsPerPage); // 전체 페이지 수 계산

    const handleCheckboxChange = (contactIndex) => {
        setCheckedContacts((prevChecked) => {
            if (prevChecked.includes(contactIndex)) {
                return prevChecked.filter((index) => index !== contactIndex);
            } else {
                return [...prevChecked, contactIndex];
            }
        });
    };

    const handleEditContact = () => {
        if (checkedContacts.length === 0) {
            alert('수정할 연락처를 선택하세요.');
        } else {
            alert(`${checkedContacts.join(', ')}번 연락처 수정`);
        }
    };

    const handleDeleteContact = () => {
        if (checkedContacts.length === 0) {
            alert('삭제할 연락처를 선택하세요.');
        } else {
            alert(`${checkedContacts.join(', ')}번 연락처 삭제`);
        }
    };

    const handlePageClick = (page) => {
        setCurrentPage(page);
        setCheckedContacts([]); // 페이지 변경 시 체크박스 초기화
    };

    return (
        <div className="contact-wrapper">
            {/* 탭 메뉴 */}
            <div className="tab-menu">
        <span
            className={`tab-item ${currentTab === 'manage' ? 'active' : ''}`}
            onClick={() => setCurrentTab('manage')}
        >
          주소록 관리
        </span>
                <span
                    className={`tab-item ${currentTab === 'input' ? 'active' : ''}`}
                    onClick={() => setCurrentTab('input')}
                >
          주소록 입력
        </span>
            </div>

            <div className="main-content">
                {currentTab === 'manage' && (
                    <>
                        <div className="left-panel">
                            <div className="folder-section">
                                <div className="folder-sort">
                                    <button onClick={toggleDropdown} className="folder-sort-button">
                                        폴더 최근 순
                                        <img src={arrowIcon} alt="폴더 정렬 화살표" className="arrow-icon" />
                                    </button>
                                    {isDropdownOpen && (
                                        <ul className="dropdown-menu">
                                            <li>등록 순</li>
                                            <li>가나다 순</li>
                                        </ul>
                                    )}
                                </div>
                                <button className="add-folder-button">
                                    <img src={folderIcon} alt="폴더 아이콘" className="folder-icon" />
                                    폴더 추가
                                </button>
                            </div>
                            <div className="folder-list">
                                {['가족', '친구', '회사'].map((folder, index) => (
                                    <div key={index} className="folder-item">
                                        <input type="checkbox" className="folder-checkbox" />
                                        <span className="folder-name">{folder}</span>
                                        <div className="folder-icons">
                                            <img src={penIcon} alt="수정" className="icon" />
                                            <img src={trashIcon} alt="삭제" className="icon" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="right-panel">
                            <div className="search-bar">
                                <input type="text" placeholder="Search" className="search-input" />
                                <div className="search-icons">
                                    <img src={penIcon} alt="아이콘" className="search-icon" />
                                    <img src={trashIcon} alt="아이콘" className="search-icon" />
                                </div>
                            </div>
                            <div className="contact-list">
                                {[...Array(contactsPerPage)].map((_, index) => {
                                    const contactIndex = (currentPage - 1) * contactsPerPage + index + 1;
                                    if (contactIndex > totalContacts) return null;
                                    return (
                                        <div key={index} className="contact-item">
                                            <input
                                                type="checkbox"
                                                className="contact-checkbox"
                                                checked={checkedContacts.includes(contactIndex)}
                                                onChange={() => handleCheckboxChange(contactIndex)}
                                            />
                                            <div className="contact-details">
                                                <span>연락처 {contactIndex}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="contact-actions-container">
                                <button className="edit-contact" onClick={handleEditContact}>
                                    연락처 수정
                                </button>
                                <button className="delete-contact" onClick={handleDeleteContact}>
                                    연락처 삭제
                                </button>
                            </div>

                            <div className="pagination">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <span
                                        key={i}
                                        className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                                        onClick={() => handlePageClick(i + 1)}
                                    >
                    {i + 1}
                  </span>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {currentTab === 'input' && (
                    <div className="input-panel">
                        <p>엑셀에 저장된 번호를 하나의 그룹에 저장하는 기능입니다. (최대 5만건)</p>
                        <p>이름 100byte, 번호 100byte, 메모 255byte 까지 입력 가능합니다.</p>
                        <p>구분선(\, 약속#시( , W), 착신#으로) 등 특수문자가 포함될 경우 올바르게 저장되지 않을 수 있습니다.</p>
                        <div className="folder-upload-section">
                            <div className="folder-sort">
                                <button onClick={toggleFolderDropdown} className="folder-sort-button">
                                    폴더 선택
                                    <img src={arrowIcon} alt="폴더 정렬 화살표" className="arrow-icon" />
                                </button>
                                {isFolderDropdownOpen && (
                                    <ul className="dropdown-menu">
                                        <li>가족</li>
                                        <li>친구</li>
                                        <li>회사</li>
                                    </ul>
                                )}
                            </div>
                            <button className="upload-button">
                                <img src={uploadIcon} alt="업로드 아이콘" className="upload-icon" />
                                엑셀 업로드
                            </button>
                        </div>

                        <div className="table-container">
                            <table className="contact-table">
                                <thead>
                                <tr>
                                    <th>이름</th>
                                    <th>휴대폰</th>
                                    <th>메모</th>
                                </tr>
                                </thead>
                                <tbody>
                                {[...Array(10)].map((_, index) => (
                                    <tr key={index}>
                                        <td contentEditable="true"></td>
                                        <td contentEditable="true"></td>
                                        <td contentEditable="true"></td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="action-buttons">
                            <button className="delete-button">삭제</button>
                            <button className="delete-all-button">전체삭제</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Contact;
