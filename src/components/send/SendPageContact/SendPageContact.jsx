// src/components/contact/SendPageContact.jsx

import React, { useState } from "react";
import * as XLSX from 'xlsx';
import "./SendPageContact.css";
import AddressBookModal from './AddressBookModal';

const SendPageContact = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [senderNumber, setSenderNumber] = useState('');
    const [isEditable, setIsEditable] = useState(true);
    const [phoneNumbers, setPhoneNumbers] = useState(''); // 다중 입력 필드 내용
    const [contactList, setContactList] = useState([]); // 연락처 리스트

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleRegisterSender = () => {
        if (senderNumber.trim()) {
            setIsEditable(false); // 발신번호 입력 비활성화
        } else {
            alert('발신번호를 입력해주세요.');
        }
    };

    const handleDeleteSender = () => {
        setSenderNumber('');
        setIsEditable(true); // 발신번호 입력 활성화
    };

    const handleAddNumbers = () => {
        const newNumbers = phoneNumbers
            .split('\n')
            .map((num) => num.trim())
            .filter((num) => num); // 공백 필터링

        setContactList((prevList) => [...prevList, ...newNumbers]);
        setPhoneNumbers(''); // 입력 필드 초기화
    };

    const handleClearAll = () => {
        setContactList([]); // 연락처 리스트 초기화
    };

    // 엑셀 파일 처리 함수
    const handleExcelUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            const numbers = sheetData.map(row => row[0]).filter(Boolean).join('\n');
            setPhoneNumbers(numbers); // 텍스트 영역에 번호 추가
        };
        reader.readAsArrayBuffer(file);
    };

    // 주소록에서 선택된 번호를 수신번호 입력칸에 추가하는 함수
    const handleSelectFromAddressBook = (selectedNumbers) => {
        const currentNumbers = phoneNumbers.split('\n').filter(Boolean);
        const allNumbers = Array.from(new Set([...currentNumbers, ...selectedNumbers]));
        setPhoneNumbers(allNumbers.join('\n'));
    };

    return (
        <div className="SendPageContact_contact-form-wrapper">
            {/* 발신번호 입력 */}
            <div className="SendPageContact_sender-section2">
                <h2>발신번호</h2>
                <div className="SendPageContact_sender-input-wrapper">
                    <input
                        type="text"
                        className="SendPageContact_input-field"
                        placeholder="발신번호를 입력해주세요"
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        disabled={!isEditable}
                    />
                    <div className="SendPageContact_sender-buttons">
                        <button className="SendPageContact_delete-button" onClick={handleDeleteSender}>삭제</button>
                        <button className="SendPageContact_register-button" onClick={handleRegisterSender}>발신번호 등록</button>
                    </div>
                </div>
            </div>

            {/* 수신번호 및 연락처 섹션을 감싸는 래퍼 */}
            <div className="SendPageContact_receiver-contact-wrapper">
                {/* 수신번호 입력 */}
                <div className="SendPageContact_receiver-section">
                    <h2>수신번호 입력</h2>
                    <div className="SendPageContact_receiver-buttons">
                        <button className="SendPageContact_address-button" onClick={openModal}>주소록</button>
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleExcelUpload}
                            style={{ display: 'none' }}
                            id="excel-upload"
                        />
                        <label htmlFor="excel-upload" className="SendPageContact_excel-button">
                            엑셀 붙여넣기
                        </label>
                    </div>
                    <textarea
                        className="SendPageContact_phone-input"
                        placeholder="휴대폰번호 입력 후 엔터 1만 건까지 붙여넣기 가능"
                        value={phoneNumbers}
                        onChange={(e) => setPhoneNumbers(e.target.value)}
                    />
                    <button className="SendPageContact_add-number-button" onClick={handleAddNumbers}>번호 추가+</button>
                </div>

                {/* 연락처 리스트 */}
                <div className="SendPageContact_contact-list-section">
                    <div className="SendPageContact_contact-list-header">
                        <h2>받는사람</h2>
                        <button className="SendPageContact_clear-all-button" onClick={handleClearAll}>전체 제거</button>
                    </div>
                    <div className="SendPageContact_table-scroll-wrapper">
                        <table className="SendPageContact_contact-table">
                            <thead>
                            <tr>
                                <th>연락처</th>
                            </tr>
                            </thead>
                            <tbody>
                            {contactList.map((number, index) => (
                                <tr key={index}>
                                    <td>{number}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 발송하기 버튼 */}
            <button className="SendPageContact_submit-button2">발송하기</button>

            {/* 주소록 모달 */}
            <AddressBookModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSelect={handleSelectFromAddressBook}
            />
        </div>
    );
};

export default SendPageContact;
