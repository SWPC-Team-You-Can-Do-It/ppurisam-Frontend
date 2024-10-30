import React, { useState } from 'react';
import './AddressBookModal.css';
import arrowIcon from '@/assets/images/contact/icon_arrow.png'; // 폴더 화살표 아이콘

const AddressBookModal = ({ isOpen, onClose }) => {
    const [selectAll, setSelectAll] = useState(false);
    const [checkedState, setCheckedState] = useState(
        new Array(10).fill(false) // 기본적으로 모든 체크박스는 체크되지 않은 상태
    );
    const [isFolderDropdownOpen, setIsFolderDropdownOpen] = useState(false); // 폴더 드롭다운 상태

    // 가족 체크박스를 선택하면 모든 체크박스를 선택/해제
    const handleSelectAll = () => {
        const newCheckedState = !selectAll;
        setSelectAll(newCheckedState);
        setCheckedState(new Array(10).fill(newCheckedState)); // '가족' 열의 체크박스를 모두 선택/해제
    };

    // 개별 체크박스를 선택/해제하는 함수
    const handleCheckBoxChange = (position) => {
        const updatedCheckedState = checkedState.map((item, index) =>
            index === position ? !item : item
        );
        setCheckedState(updatedCheckedState);
    };

    const toggleFolderDropdown = () => {
        setIsFolderDropdownOpen(!isFolderDropdownOpen);
    };

    if (!isOpen) return null;

    return (
        <div
            className="address-modal-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="address-modal-content"
                onClick={(e) => e.stopPropagation()} // 모달 내용 클릭 시 닫히지 않도록 방지
            >
                <button
                    className="address-modal-close-button"
                    onClick={onClose}
                    aria-label="모달 닫기"
                >
                    &times;
                </button>
                <h2>주소록</h2>

                {/* 폴더 선택 버튼 */}
                <div className="folder-dropdown-wrapper">
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

                <div className="table-container2">
                    <table className="contact-table2">
                        <thead>
                        <tr>
                            <th>
                                {/* '가족' 체크박스 (모든 열 선택) */}
                                <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th>가족</th> {/* 가족 열 */}
                            <th>이름</th>
                            <th>휴대폰</th>
                            <th>메모</th>
                        </tr>
                        </thead>
                        <tbody>
                        {[...Array(10)].map((_, index) => (
                            <tr key={index}>
                                <td>
                                    {/* 개별 체크박스 */}
                                    <input
                                        type="checkbox"
                                        checked={checkedState[index]}
                                        onChange={() => handleCheckBoxChange(index)}
                                    />
                                </td>
                                <td contentEditable="false"></td>
                                <td contentEditable="true"></td>
                                <td contentEditable="true"></td>
                                <td contentEditable="true"></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AddressBookModal;
