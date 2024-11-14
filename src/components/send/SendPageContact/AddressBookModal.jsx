// src/components/contact/AddressBookModal.jsx

import React, { useState, useEffect } from 'react';
import './AddressBookModal.css';
import arrowIcon from '../../../assets/images/contact/icon_arrow.png';
import axiosInstance from '../../login/axiosInstance';

const AddressBookModal = ({ isOpen, onClose, onSelect }) => {
    const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [checkedState, setCheckedState] = useState([]);

    // 모달이 열릴 때 그룹 목록 가져오기
    useEffect(() => {
        if (isOpen) {
            fetchGroups();
        }
    }, [isOpen]);

    // 그룹 목록 가져오기
    const fetchGroups = async () => {
        try {
            const response = await axiosInstance.get('/api/groups');
            setGroups(response.data);
        } catch (err) {
            console.error('그룹 목록을 가져오는 중 오류 발생:', err);
        }
    };

    // 그룹 선택 시 연락처 목록 가져오기
    useEffect(() => {
        if (selectedGroup) {
            fetchContacts(selectedGroup.id);
        }
    }, [selectedGroup]);

    // 연락처 목록 가져오기
    const fetchContacts = async (groupId) => {
        try {
            const response = await axiosInstance.get('/api/contacts', {
                params: {
                    group_id: groupId,
                    page: 0,
                    size: 100000,
                    search: '',
                    sort: '등록 순',
                },
            });

            const fetchedContacts = response.data.content || response.data;
            const filteredContacts = fetchedContacts.filter(contact => contact.group_id === groupId);

            setContacts(filteredContacts);
            setCheckedState(new Array(filteredContacts.length).fill(false));
        } catch (err) {
            console.error('연락처 목록을 가져오는 중 오류 발생:', err);
        }
    };

    const toggleGroupDropdown = () => {
        setIsGroupDropdownOpen(!isGroupDropdownOpen);
    };

    const handleGroupSelect = (group) => {
        setSelectedGroup(group);
        setIsGroupDropdownOpen(false);
    };

    // 체크박스 전체 선택/해제
    const handleSelectAll = () => {
        const allChecked = checkedState.every(Boolean);
        const newCheckedState = new Array(checkedState.length).fill(!allChecked);
        setCheckedState(newCheckedState);
    };

    // 개별 체크박스 선택/해제
    const handleCheckBoxChange = (position) => {
        const updatedCheckedState = checkedState.map((item, index) =>
            index === position ? !item : item
        );
        setCheckedState(updatedCheckedState);
    };

    // 선택 완료 버튼 클릭 시
    const handleSelectComplete = () => {
        const selectedContacts = contacts.filter((_, index) => checkedState[index]);
        const phoneNumbers = selectedContacts.map(contact => contact.phone_number);
        onSelect(phoneNumbers);
        onClose(); // 모달 닫기
    };

    if (!isOpen) return null;

    return (
        <div
            className="AddressBookModal_address-modal-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="AddressBookModal_address-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="AddressBookModal_address-modal-close-button"
                    onClick={onClose}
                    aria-label="모달 닫기"
                >
                    &times;
                </button>
                <h2>주소록</h2>

                {/* 그룹 선택 버튼 */}
                <div className="AddressBookModal_group-dropdown-wrapper">
                    <button onClick={toggleGroupDropdown} className="AddressBookModal_group-select-button">
                        {selectedGroup ? selectedGroup.name : '그룹 선택'}
                        <img src={arrowIcon} alt="그룹 선택 화살표" className="AddressBookModal_arrow-icon" />
                    </button>
                    {isGroupDropdownOpen && (
                        <ul className="AddressBookModal_dropdown-menu">
                            {groups.map((group) => (
                                <li key={group.id} onClick={() => handleGroupSelect(group)}>
                                    {group.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="AddressBookModal_table-container2">
                    <table className="AddressBookModal_contact-table2">
                        <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={checkedState.length > 0 && checkedState.every(Boolean)}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th>이름</th>
                            <th>휴대폰</th>
                            <th>메모</th>
                        </tr>
                        </thead>
                        <tbody>
                        {contacts.map((contact, index) => (
                            <tr key={contact.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={checkedState[index] || false}
                                        onChange={() => handleCheckBoxChange(index)}
                                    />
                                </td>
                                <td>{contact.name}</td>
                                <td>{contact.phone_number}</td>
                                <td>{contact.memo}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* 선택 완료 버튼 */}
                <button
                    className="AddressBookModal_select-complete-button"
                    onClick={handleSelectComplete}
                >
                    선택 완료
                </button>
            </div>
        </div>
    );
};

export default AddressBookModal;
