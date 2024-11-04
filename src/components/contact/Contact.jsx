// src/components/contact/Contact.jsx

import React, { useState } from 'react';
import * as XLSX from 'xlsx'; // xlsx 라이브러리 추가
import './Contact.css';
import penIcon from '@/assets/images/contact/Pen.png';
import trashIcon from '@/assets/images/contact/trash.png';
import arrowIcon from '@/assets/images/contact/icon_arrow.png';
import folderIcon from '@/assets/images/contact/folder.png';
import uploadIcon from '@/assets/images/contact/Upload.png';
import userIcon from '@/assets/images/contact/user.png';
import phoneIcon from '@/assets/images/contact/phone.png';
import messageIcon from '@/assets/images/contact/Message.png';
import { contactDetails } from './ContactData';

const Contact = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isFolderDropdownOpen, setIsFolderDropdownOpen] = useState(false);
    const [isAddingFolder, setIsAddingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [folders, setFolders] = useState([
        { name: '가족', isEditing: false },
        { name: '친구', isEditing: false },
        { name: '회사', isEditing: false }
    ]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentTab, setCurrentTab] = useState('manage');
    const [checkedContacts, setCheckedContacts] = useState([]);
    const [contacts, setContacts] = useState(
        Array.from({ length: 18 }, (_, i) => ({ id: i + 1, name: `연락처 ${i + 1}` }))
    );
    const [uploadedContacts, setUploadedContacts] = useState([]); // 업로드된 연락처 상태 추가
    const [expandedContact, setExpandedContact] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [folderToDelete, setFolderToDelete] = useState(null);

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
    const toggleFolderDropdown = () => setIsFolderDropdownOpen(!isFolderDropdownOpen);
    const handleAddFolderClick = () => setIsAddingFolder(!isAddingFolder);

    const handleAddNewFolder = () => {
        if (newFolderName.trim()) {
            setFolders([...folders, { name: newFolderName.trim(), isEditing: false }]);
            setNewFolderName('');
            setIsAddingFolder(false);
        } else {
            alert('폴더 이름을 입력하세요.');
        }
    };

    const handleEditFolder = (index) => {
        const updatedFolders = folders.map((folder, i) => (
            i === index ? { ...folder, isEditing: true } : folder
        ));
        setFolders(updatedFolders);
    };

    const handleFolderNameChange = (e, index) => {
        const updatedFolders = folders.map((folder, i) => (
            i === index ? { ...folder, name: e.target.value } : folder
        ));
        setFolders(updatedFolders);
    };

    const handleFolderNameSubmit = (e, index) => {
        if (e.key === 'Enter') {
            const updatedFolders = folders.map((folder, i) => (
                i === index ? { ...folder, isEditing: false } : folder
            ));
            setFolders(updatedFolders);
        }
    };

    const handleDeleteFolder = (index) => {
        setFolderToDelete(index);
        setShowDeleteModal(true);
    };

    const confirmDeleteFolder = () => {
        setFolders(folders.filter((_, i) => i !== folderToDelete));
        setShowDeleteModal(false);
        setFolderToDelete(null);
    };

    const contactsPerPage = 6;
    const totalPages = Math.ceil(contacts.length / contactsPerPage);

    const handleCheckboxChange = (contactId) => {
        setCheckedContacts((prevChecked) =>
            prevChecked.includes(contactId)
                ? prevChecked.filter((id) => id !== contactId)
                : [...prevChecked, contactId]
        );
    };

    const handleEditContact = () => {
        if (checkedContacts.length === 0) {
            alert('수정할 연락처를 선택하세요.');
        } else {
            setShowEditModal(true);
        }
    };

    const handleDeleteContact = () => {
        if (checkedContacts.length === 0) {
            alert('삭제할 연락처를 선택하세요.');
        } else {
            setContacts(contacts.filter((contact) => !checkedContacts.includes(contact.id)));
            setCheckedContacts([]);
            alert('선택한 연락처가 삭제되었습니다.');
        }
    };

    const handlePageClick = (page) => {
        setCurrentPage(page);
        setCheckedContacts([]);
    };

    const closeEditModal = () => setShowEditModal(false);

    const toggleExpandContact = (contactId) => {
        setExpandedContact((prev) => (prev === contactId ? null : contactId));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { header: ['name', 'phone', 'memo'], defval: '' });
                setUploadedContacts(json);
            };
            reader.readAsArrayBuffer(file);
        }
    };

    return (
        <div className="Contact_wrapper">
            <div className="Contact_tab-menu">
                <span
                    className={`Contact_tab-item ${currentTab === 'manage' ? 'active' : ''}`}
                    onClick={() => setCurrentTab('manage')}
                >
                    주소록 관리
                </span>
                <span
                    className={`Contact_tab-item ${currentTab === 'input' ? 'active' : ''}`}
                    onClick={() => setCurrentTab('input')}
                >
                    주소록 입력
                </span>
            </div>

            <div className="Contact_main-content">
                {currentTab === 'manage' && (
                    <>
                        <div className="Contact_left-panel">
                            <div className="Contact_folder-section">
                                <div className="Contact_folder-sort">
                                    <button onClick={toggleDropdown} className="Contact_folder-sort-button">
                                        폴더 최근 순
                                        <img src={arrowIcon} alt="폴더 정렬 화살표" className="Contact_arrow-icon" />
                                    </button>
                                    {isDropdownOpen && (
                                        <ul className="Contact_dropdown-menu">
                                            <li>등록 순</li>
                                            <li>가나다 순</li>
                                        </ul>
                                    )}
                                </div>
                                <button className="Contact_add-folder-button" onClick={handleAddFolderClick}>
                                    <img src={folderIcon} alt="폴더 아이콘" className="Contact_folder-icon" />
                                    폴더 추가
                                </button>
                            </div>

                            {isAddingFolder && (
                                <div className="Contact_add-folder-input-wrapper">
                                    <input
                                        type="text"
                                        className="Contact_add-folder-input"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        placeholder="폴더 이름 입력"
                                    />
                                    <button className="Contact_add-folder-confirm-button" onClick={handleAddNewFolder}>
                                        추가
                                    </button>
                                </div>
                            )}

                            <div className="Contact_folder-list">
                                {folders.map((folder, index) => (
                                    <div key={index} className="Contact_folder-item">
                                        <input type="checkbox" className="Contact_folder-checkbox" />
                                        {folder.isEditing ? (
                                            <input
                                                type="text"
                                                value={folder.name}
                                                className="Contact_edit-folder-input"
                                                onChange={(e) => handleFolderNameChange(e, index)}
                                                onKeyDown={(e) => handleFolderNameSubmit(e, index)}
                                            />
                                        ) : (
                                            <span className="Contact_folder-name">{folder.name}</span>
                                        )}
                                        <div className="Contact_folder-icons">
                                            <img
                                                src={penIcon}
                                                alt="수정"
                                                className="Contact_icon"
                                                onClick={() => handleEditFolder(index)}
                                            />
                                            <img
                                                src={trashIcon}
                                                alt="삭제"
                                                className="Contact_icon"
                                                onClick={() => handleDeleteFolder(index)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="Contact_right-panel">
                            <div className="Contact_search-bar">
                                <input type="text" placeholder="Search" className="Contact_search-input" />
                            </div>
                            <div className="Contact_contact-list">
                                {contacts.slice((currentPage - 1) * contactsPerPage, currentPage * contactsPerPage).map((contact) => (
                                    <div key={contact.id} className="Contact_contact-item">
                                        <input
                                            type="checkbox"
                                            className="Contact_contact-checkbox"
                                            checked={checkedContacts.includes(contact.id)}
                                            onChange={() => handleCheckboxChange(contact.id)}
                                        />
                                        <div
                                            className={`Contact_contact-details ${expandedContact === contact.id ? 'expanded' : ''}`}
                                            onClick={() => toggleExpandContact(contact.id)}
                                        >
                                            <span>{contact.name}</span>
                                            {expandedContact === contact.id && (
                                                <div className="Contact_contact-extra">
                                                    <p>휴대폰: {contactDetails[contact.id]?.phone || '정보 없음'}</p>
                                                    <p>메모: {contactDetails[contact.id]?.memo || '정보 없음'}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="Contact_contact-actions-container">
                                <button className="Contact_edit-contact" onClick={handleEditContact}>
                                    연락처 수정
                                </button>
                                <button className="Contact_delete-contact" onClick={handleDeleteContact}>
                                    연락처 삭제
                                </button>
                            </div>

                            <div className="Contact_pagination">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <span
                                        key={i}
                                        className={`Contact_page-number ${currentPage === i + 1 ? 'active' : ''}`}
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
                    <div className="Contact_input-panel">
                        <p>엑셀에 저장된 번호를 하나의 그룹에 저장하는 기능입니다. (최대 5만건)</p>
                        <p>이름 100byte, 번호 100byte, 메모 255byte 까지 입력 가능합니다.</p>
                        <p>구분선(\, 약속#시( , W), 착신#으로) 등 특수문자가 포함될 경우 올바르게 저장되지 않을 수 있습니다.</p>
                        <div className="Contact_folder-upload-section">
                            <div className="Contact_folder-sort">
                                <button onClick={toggleFolderDropdown} className="Contact_folder-sort-button">
                                    폴더 선택
                                    <img src={arrowIcon} alt="폴더 정렬 화살표" className="Contact_arrow-icon" />
                                </button>
                                {isFolderDropdownOpen && (
                                    <ul className="Contact_dropdown-menu">
                                        {folders.map((folder, index) => (
                                            <li key={index}>{folder.name}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <label className="Contact_upload-button">
                                <img src={uploadIcon} alt="업로드 아이콘" className="Contact_upload-icon" />
                                엑셀 업로드
                                <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} style={{ display: 'none' }} />
                            </label>
                        </div>

                        <div className="Contact_table-container">
                            <table className="Contact_contact-table">
                                <thead>
                                <tr>
                                    <th>이름</th>
                                    <th>휴대폰</th>
                                    <th>메모</th>
                                </tr>
                                </thead>
                                <tbody>
                                {uploadedContacts.map((contact, index) => (
                                    <tr key={index}>
                                        <td>{contact.name}</td>
                                        <td>{contact.phone}</td>
                                        <td>{contact.memo}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="Contact_action-buttons">
                            <button className="Contact_delete-button">삭제</button>
                            <button className="Contact_delete-all-button">전체삭제</button>
                        </div>
                    </div>
                )}
            </div>

            {/* 폴더 삭제 모달 */}
            {showDeleteModal && (
                <div className="Contact_modal-overlay">
                    <div className="Contact_modal-content">
                        <p>폴더를 삭제하시겠습니까?</p>
                        <div className="Contact_modal-actions">
                            <button className="Contact_modal-delete" onClick={confirmDeleteFolder}>삭제</button>
                            <button className="Contact_modal-cancel" onClick={() => setShowDeleteModal(false)}>취소</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 연락처 수정 모달 */}
            {showEditModal && (
                <div className="Contact_modal-overlay">
                    <div className="Contact_edit-modal">
                        <div className="Contact_edit-modal-header">
                            <h2 className="Contact_edit-title">연락처 수정</h2>
                            <div className="Contact_folder-dropdown">
                                <button onClick={toggleFolderDropdown} className="Contact_folder-sort-button">
                                    폴더 <img src={arrowIcon} alt="폴더 정렬 화살표" className="Contact_arrow-icon" />
                                </button>
                                {isFolderDropdownOpen && (
                                    <ul className="Contact_dropdown-menu">
                                        {folders.map((folder, index) => (
                                            <li key={index}>{folder.name}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                        <div className="Contact_edit-form">
                            <div className="Contact_edit-input">
                                <img src={userIcon} alt="user" className="Contact_edit-icon" />
                                <input type="text" placeholder="이름" />
                            </div>
                            <div className="Contact_edit-input">
                                <img src={phoneIcon} alt="phone" className="Contact_edit-icon" />
                                <input type="text" placeholder="전화번호" />
                            </div>
                            <div className="Contact_edit-textarea">
                                <img src={messageIcon} alt="message" className="Contact_edit-icon" />
                                <textarea placeholder="메모"></textarea>
                            </div>
                        </div>
                        <div className="Contact_edit-modal-actions">
                            <button className="Contact_edit-button" onClick={closeEditModal}>수정</button>
                            <button className="Contact_cancel-button" onClick={closeEditModal}>취소</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contact;
