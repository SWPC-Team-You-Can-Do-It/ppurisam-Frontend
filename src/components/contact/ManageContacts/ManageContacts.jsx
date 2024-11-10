// src/components/contact/ManageContacts/ManageContacts.jsx
import React, { useState, useEffect } from 'react';
import './ManageContacts.css';
import penIcon from '../../../assets/images/contact/Pen.png';
import trashIcon from '../../../assets/images/contact/trash.png';
import arrowIcon from '../../../assets/images/contact/icon_arrow.png';
import folderIcon from '../../../assets/images/contact/folder.png';
import EditContactModal from '../EditContactModal/EditContactModal';
import axiosInstance from '../../login/axiosInstance'; // axiosInstance 임포트

const ManageContacts = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAddingFolder, setIsAddingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [folderSortOption, setFolderSortOption] = useState('등록 순');
    const [selectedFolder, setSelectedFolder] = useState(null);

    const [folders, setFolders] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [folderToDelete, setFolderToDelete] = useState(null);

    const [contacts, setContacts] = useState([]);
    const [checkedContacts, setCheckedContacts] = useState([]);
    const [expandedContact, setExpandedContact] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [contactToEdit, setContactToEdit] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [isLoadingFolders, setIsLoadingFolders] = useState(false);
    const [isLoadingContacts, setIsLoadingContacts] = useState(false);
    const [error, setError] = useState('');

    const contactsPerPage = 6; // 페이지당 연락처 수

    // 폴더 데이터 Fetching
    useEffect(() => {
        const fetchFolders = async () => {
            setIsLoadingFolders(true);
            try {
                const response = await axiosInstance.get('/api/groups');
                setFolders(response.data);
            } catch (err) {
                console.error('폴더 불러오기 오류:', err);
                setError('폴더를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setIsLoadingFolders(false);
            }
        };

        fetchFolders();
    }, []);

    // 선택된 폴더에 따른 연락처 Fetching
    useEffect(() => {
        const fetchContacts = async () => {
            if (!selectedFolder) {
                setContacts([]);
                return;
            }
            setIsLoadingContacts(true);
            try {
                const response = await axiosInstance.get('/api/contacts', {
                    params: {
                        // group_id: Number(selectedFolder.id), // 클라이언트 사이드 필터링을 위해 제거
                        page: currentPage - 1,               // 현재 페이지 (0부터 시작)
                        size: contactsPerPage,               // 페이지당 연락처 수
                        search: searchTerm,
                        sort: folderSortOption
                    }
                });

                // API 응답 구조 확인
                console.log('Fetched Contacts:', response.data);

                // 만약 response.data가 Pageable 구조라면 content를 사용
                const fetchedContacts = response.data.content || response.data;

                // 클라이언트 사이드에서 group_id로 필터링
                const filteredByGroup = fetchedContacts.filter(contact => contact.group_id === Number(selectedFolder.id));

                setContacts(filteredByGroup);
            } catch (err) {
                console.error('연락처 불러오기 오류:', err);
                setError('연락처를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setIsLoadingContacts(false);
            }
        };

        fetchContacts();
    }, [selectedFolder, currentPage, searchTerm, folderSortOption]);

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
    const handleAddFolderClick = () => setIsAddingFolder(!isAddingFolder);

    // 폴더 추가 핸들러 (API 연동)
    const handleAddNewFolder = async () => {
        if (newFolderName.trim()) {
            try {
                const response = await axiosInstance.post('/api/groups', { name: newFolderName.trim() });
                setFolders([...folders, response.data]);
                setNewFolderName('');
                setIsAddingFolder(false);
            } catch (err) {
                console.error('폴더 추가 오류:', err);
                setError('폴더를 추가하는 중 오류가 발생했습니다.');
            }
        } else {
            alert('폴더 이름을 입력하세요.');
        }
    };

    // 폴더 수정 핸들러 (API 연동)
    const handleEditFolder = async (index) => {
        const folder = sortedFolders[index];
        if (!folder.isEditing) {
            const updatedFolders = folders.map((f, i) =>
                i === index ? { ...f, isEditing: true } : f
            );
            setFolders(updatedFolders);
        } else {
            if (folder.name.trim() === '') {
                alert('폴더 이름을 입력하세요.');
                return;
            }
            try {
                const response = await axiosInstance.put(`/api/groups/${folder.id}`, { name: folder.name.trim() });
                const updatedFolders = folders.map((f) =>
                    f.id === folder.id ? { ...response.data, isEditing: false } : f
                );
                setFolders(updatedFolders);
            } catch (err) {
                console.error('폴더 수정 오류:', err);
                setError('폴더를 수정하는 중 오류가 발생했습니다.');
            }
        }
    };

    // 폴더 이름 변경 핸들러
    const handleFolderNameChange = (e, index) => {
        const updatedFolders = folders.map((folder, i) =>
            i === index ? { ...folder, name: e.target.value } : folder
        );
        setFolders(updatedFolders);
    };

    // 엔터 키로 폴더 이름 수정 완료
    const handleFolderNameSubmit = (e, index) => {
        if (e.key === 'Enter') {
            handleEditFolder(index);
        }
    };

    // 폴더 삭제 핸들러 (API 연동)
    const handleDeleteFolder = async (index) => {
        const folder = sortedFolders[index];
        setFolderToDelete(folder.id);
        setShowDeleteModal(true);
    };

    const confirmDeleteFolder = async () => {
        try {
            await axiosInstance.delete(`/api/groups/${folderToDelete}`);
            setFolders(folders.filter((folder) => folder.id !== folderToDelete));
            setShowDeleteModal(false);
            setFolderToDelete(null);
            if (selectedFolder && selectedFolder.id === folderToDelete) {
                setSelectedFolder(null);
            }
        } catch (err) {
            console.error('폴더 삭제 오류:', err);
            setError('폴더를 삭제하는 중 오류가 발생했습니다.');
        }
    };

    // 폴더 클릭 핸들러
    const handleFolderClick = (folderId) => {
        const selectedFolderObj = folders.find((folder) => folder.id === folderId);
        setSelectedFolder(selectedFolderObj);
        setCurrentPage(1); // 페이지 초기화
        setCheckedContacts([]); // 체크된 연락처 초기화
    };

    // 연락처 체크박스 변경 핸들러
    const handleCheckboxChange = (contactId) => {
        setCheckedContacts((prevChecked) =>
            prevChecked.includes(contactId)
                ? prevChecked.filter((id) => id !== contactId)
                : [...prevChecked, contactId]
        );
    };

    // 연락처 수정 핸들러
    const handleEditContact = () => {
        if (checkedContacts.length !== 1) {
            alert('수정할 연락처를 하나만 선택하세요.');
        } else {
            const contact = contacts.find((c) => c.id === checkedContacts[0]);
            setContactToEdit(contact);
            setShowEditModal(true);
        }
    };

    // 연락처 수정 후 업데이트 핸들러 (API 연동)
    const updateContact = async (contactId, updatedData) => {
        try {
            const response = await axiosInstance.put(`/api/contacts/${contactId}`, updatedData);
            const updatedContacts = contacts.map((contact) =>
                contact.id === contactId ? response.data : contact
            );
            setContacts(updatedContacts);
            setShowEditModal(false);
            setCheckedContacts([]);
            alert('연락처가 성공적으로 수정되었습니다.');
        } catch (err) {
            console.error('연락처 수정 오류:', err);
            setError('연락처를 수정하는 중 오류가 발생했습니다.');
        }
    };

    // 연락처 삭제 핸들러 (API 연동)
    const handleDeleteContact = async () => {
        if (checkedContacts.length === 0) {
            alert('삭제할 연락처를 선택하세요.');
        } else {
            if (!window.confirm('선택한 연락처를 정말로 삭제하시겠습니까?')) return;
            try {
                await Promise.all(checkedContacts.map((id) => axiosInstance.delete(`/api/contacts/${id}`)));
                const updatedContacts = contacts.filter((contact) => !checkedContacts.includes(contact.id));
                setContacts(updatedContacts);
                setCheckedContacts([]);
                alert('선택한 연락처가 삭제되었습니다.');
            } catch (err) {
                console.error('연락처 삭제 오류:', err);
                setError('연락처를 삭제하는 중 오류가 발생했습니다.');
            }
        }
    };

    // 페이지 클릭 핸들러
    const handlePageClick = (page) => {
        setCurrentPage(page);
        setCheckedContacts([]);
    };

    // 연락처 확장/축소 핸들러
    const toggleExpandContact = (contactId) => {
        setExpandedContact((prev) => (prev === contactId ? null : contactId));
    };

    // 검색어 변경 핸들러
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // 검색 시 페이지 초기화
    };

    // 폴더 정렬
    let sortedFolders = [...folders];
    if (folderSortOption === '최근 순') {
        sortedFolders.sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed));
    } else if (folderSortOption === '등록 순') {
        sortedFolders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (folderSortOption === '가나다 순') {
        sortedFolders.sort((a, b) => a.name.localeCompare(b.name));
    }

    // 서버 사이드 필터링 후, 클라이언트 사이드 검색어 필터링
    const filteredContacts = contacts.filter(
        (contact) =>
            contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPagesFiltered = Math.ceil(filteredContacts.length / contactsPerPage);

    return (
        <div className="ManageContacts_wrapper">
            {/* 왼쪽 패널: 그룹 관리 */}
            <div className="ManageContacts_left-panel">
                <div className="ManageContacts_folder-section">
                    <div className="ManageContacts_folder-sort">
                        <button onClick={toggleDropdown} className="ManageContacts_folder-sort-button">
                            폴더 {folderSortOption}
                            <img src={arrowIcon} alt="폴더 정렬 화살표" className="ManageContacts_arrow-icon" />
                        </button>
                        {isDropdownOpen && (
                            <ul className="ManageContacts_dropdown-menu">
                                <li onClick={() => { setFolderSortOption('최근 순'); setIsDropdownOpen(false); }}>최근 순</li>
                                <li onClick={() => { setFolderSortOption('등록 순'); setIsDropdownOpen(false); }}>등록 순</li>
                                <li onClick={() => { setFolderSortOption('가나다 순'); setIsDropdownOpen(false); }}>가나다 순</li>
                            </ul>
                        )}
                    </div>
                    <button className="ManageContacts_add-folder-button" onClick={handleAddFolderClick}>
                        <img src={folderIcon} alt="폴더 아이콘" className="ManageContacts_folder-icon" />
                        폴더 추가
                    </button>
                </div>

                {isAddingFolder && (
                    <div className="ManageContacts_add-folder-input-wrapper">
                        <input
                            type="text"
                            className="ManageContacts_add-folder-input"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="폴더 이름 입력"
                        />
                        <button className="ManageContacts_add-folder-confirm-button" onClick={handleAddNewFolder}>
                            추가
                        </button>
                    </div>
                )}

                {isLoadingFolders ? (
                    <p>폴더를 불러오는 중...</p>
                ) : (
                    <div className="ManageContacts_folder-list">
                        {sortedFolders.map((folder, index) => (
                            <div
                                key={folder.id}
                                className={`ManageContacts_folder-item ${selectedFolder && selectedFolder.id === folder.id ? 'selected' : ''}`}
                                onClick={() => handleFolderClick(folder.id)}
                            >
                                <input type="checkbox" className="ManageContacts_folder-checkbox" />
                                {folder.isEditing ? (
                                    <input
                                        type="text"
                                        value={folder.name}
                                        className="ManageContacts_edit-folder-input"
                                        onChange={(e) => handleFolderNameChange(e, index)}
                                        onKeyDown={(e) => handleFolderNameSubmit(e, index)}
                                    />
                                ) : (
                                    <span className="ManageContacts_folder-name">{folder.name}</span>
                                )}
                                <div className="ManageContacts_folder-icons">
                                    <img
                                        src={penIcon}
                                        alt="수정"
                                        className="ManageContacts_icon"
                                        onClick={(e) => { e.stopPropagation(); handleEditFolder(index); }}
                                    />
                                    <img
                                        src={trashIcon}
                                        alt="삭제"
                                        className="ManageContacts_icon"
                                        onClick={(e) => { e.stopPropagation(); handleDeleteFolder(index); }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 오른쪽 패널: 연락처 관리 */}
            <div className="ManageContacts_right-panel">
                <div className="ManageContacts_search-and-actions">
                    <div className="ManageContacts_search-bar">
                        <input
                            type="text"
                            placeholder="검색어를 입력하세요"
                            className="ManageContacts_search-input"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>

                {selectedFolder ? (
                    <>
                        {isLoadingContacts ? (
                            <p>연락처를 불러오는 중...</p>
                        ) : (
                            <div className="ManageContacts_contact-container">
                                {/* 연락처 목록과 페이지네이션을 함께 포함 */}
                                <div className="ManageContacts_list-and-pagination">
                                    {/* 연락처 목록 */}
                                    <div className="ManageContacts_contact-list">
                                        {filteredContacts.length === 0 ? (
                                            <p>연락처가 없습니다.</p>
                                        ) : (
                                            filteredContacts
                                                .slice((currentPage - 1) * contactsPerPage, currentPage * contactsPerPage)
                                                .map((contact) => (
                                                    <div key={contact.id} className="ManageContacts_contact-item">
                                                        <input
                                                            type="checkbox"
                                                            className="ManageContacts_contact-checkbox"
                                                            checked={checkedContacts.includes(contact.id)}
                                                            onChange={() => handleCheckboxChange(contact.id)}
                                                        />
                                                        <div
                                                            className={`ManageContacts_contact-details ${
                                                                expandedContact === contact.id ? 'expanded' : ''
                                                            }`}
                                                            onClick={() => toggleExpandContact(contact.id)}
                                                        >
                                                            <span className="ManageContacts_contact-name">{contact.name}</span>
                                                            {expandedContact === contact.id && (
                                                                <div className="ManageContacts_contact-extra">
                                                                    <p>휴대폰: {contact.phone_number || '정보 없음'}</p>
                                                                    <p>메모: {contact.memo || '정보 없음'}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                        )}
                                    </div>
                                    {/* 페이지 네비게이션 */}
                                    <div className="ManageContacts_pagination">
                                        {Array.from({ length: totalPagesFiltered }, (_, i) => (
                                            <span
                                                key={i}
                                                className={`ManageContacts_page-number ${currentPage === i + 1 ? 'active' : ''}`}
                                                onClick={() => handlePageClick(i + 1)}
                                            >
                                                {i + 1}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {/* 연락처 액션 버튼 */}
                                <div className="ManageContacts_action-buttons">
                                    <button
                                        className="ManageContacts_edit-button"
                                        onClick={handleEditContact}
                                        disabled={checkedContacts.length !== 1}
                                    >
                                        연락처 수정
                                    </button>
                                    <button
                                        className="ManageContacts_delete-button"
                                        onClick={handleDeleteContact}
                                        disabled={checkedContacts.length === 0}
                                    >
                                        연락처 삭제
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="ManageContacts_no-folder-selected">폴더를 선택해주세요.</p>
                )}
            </div>

            {/* 그룹 삭제 확인 모달 */}
            {showDeleteModal && (
                <div className="ManageContacts_modal-overlay">
                    <div className="ManageContacts_modal-content">
                        <p>그룹을 삭제하시겠습니까?</p>
                        <div className="ManageContacts_modal-actions">
                            <button className="ManageContacts_modal-delete" onClick={confirmDeleteFolder}>
                                삭제
                            </button>
                            <button
                                className="ManageContacts_modal-cancel"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 연락처 수정 모달 */}
            {showEditModal && contactToEdit && (
                <EditContactModal
                    contact={contactToEdit}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={updateContact}
                />
            )}

            {/* 에러 메시지 표시 */}
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default ManageContacts;
