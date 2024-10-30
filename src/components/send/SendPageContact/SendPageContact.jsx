import React, { useState } from "react";
import "./SendPageContact.css";
import AddressBookModal from './AddressBookModal'; // 모달 컴포넌트 임포트

const SendPageContact = () => {
    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태

    const openModal = () => {
        setIsModalOpen(true); // 모달 열기
    };

    const closeModal = () => {
        setIsModalOpen(false); // 모달 닫기
    };

    return (
        <div className="contact-form-wrapper">
            {/* 발신번호 입력 */}
            <div className="sender-section2">
                <h2>발신번호</h2>
                <div className="sender-input-wrapper">
                    <input
                        type="text"
                        className="input-field"
                        placeholder="발신번호를 입력해주세요"
                    />
                    <div className="sender-buttons">
                        <button className="delete-button">삭제</button>
                        <button className="register-button">발신번호 등록</button>
                    </div>
                </div>
            </div>

            {/* 수신번호 및 연락처 섹션을 감싸는 래퍼 */}
            <div className="receiver-contact-wrapper">
                {/* 수신번호 입력 */}
                <div className="receiver-section">
                    <h2>수신번호 입력</h2>
                    <div className="receiver-buttons">
                        <button className="address-button" onClick={openModal}>주소록</button>
                        <button className="excel-button">엑셀 붙여넣기</button>
                    </div>
                    <textarea
                        className="phone-input"
                        placeholder="휴대폰번호 입력 후 엔터 1만 건까지 붙여넣기 가능"
                    />
                    <button className="add-number-button">번호 추가+</button>
                </div>

                {/* 연락처 리스트 */}
                <div className="contact-list-section">
                    <div className="contact-list-header">
                        <h2>받는사람</h2>
                        <button className="clear-all-button">전체 제거</button>
                    </div>
                    <table className="contact-table1">
                        <thead>
                        <tr>
                        </tr>
                        </thead>
                        <tbody>
                        {[...Array(15)].map((_, index) => (
                            <tr key={index}>
                                <td></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 발송하기 버튼 */}
            <button className="submit-button1">발송하기</button>

            {/* 주소록 모달 */}
            <AddressBookModal isOpen={isModalOpen} onClose={closeModal} />
        </div>
    );
};

export default SendPageContact;
