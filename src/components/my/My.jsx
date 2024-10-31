// My.jsx
import React, { useState } from 'react';
import './My.css';
import trashIcon from '@/assets/images/My/Trash.png';

const My = () => {
    const [isPasswordChangeVisible, setPasswordChangeVisible] = useState(false);
    const [isEditingDisabled, setIsEditingDisabled] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState("장원진");
    const [phone, setPhone] = useState("010-1234-5678");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordMatchMessage, setPasswordMatchMessage] = useState("");
    const [isPasswordMatch, setIsPasswordMatch] = useState(null);

    const togglePasswordChange = () => {
        setPasswordChangeVisible(!isPasswordChangeVisible);
    };

    const handleNewPasswordChange = (e) => {
        setNewPassword(e.target.value);
        checkPasswords(e.target.value, confirmPassword);
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        checkPasswords(newPassword, e.target.value);
    };

    const checkPasswords = (password, confirm) => {
        if (password && confirm) {
            if (password === confirm) {
                setPasswordMatchMessage("두 비밀번호가 일치합니다.");
                setIsPasswordMatch(true);
            } else {
                setPasswordMatchMessage("두 비밀번호가 일치하지 않습니다.");
                setIsPasswordMatch(false);
            }
        } else {
            setPasswordMatchMessage("");
            setIsPasswordMatch(null);
        }
    };

    const handleConfirmChange = () => {
        setIsEditingDisabled(true);
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="My_container">
            <div className="My_description">* 회원님의 정보를 변경할 수 있습니다.</div>

            <div className="My_content-wrapper">
                <div className="My_main-title">내 계정 관리</div>

                <div className="My_info-section">
                    <div className="My_label-wrapper">
                        <label className="My_label">이메일</label>
                        <div className="My_info-item">Ppurio@naver.com</div>
                    </div>

                    <div className="My_info-item My_info-password">
                        <div className="My_label-wrapper">
                            <label className="My_label">비밀번호</label>
                        </div>
                        <button className="My_change-password-button" onClick={togglePasswordChange}>
                            비밀번호 변경
                        </button>
                    </div>

                    {isPasswordChangeVisible && (
                        <div className="My_password-change-section">
                            <div className="My_password-input">
                                <label className="My_password-label">현재 비밀번호</label>
                                <input
                                    type="password"
                                    className="My_input-box"
                                    placeholder="영어, 숫자 또는 특수문자 조합 20자 이내"
                                    disabled={isEditingDisabled}
                                />
                            </div>
                            <div className="My_password-input">
                                <label className="My_password-label">새 비밀번호</label>
                                <input
                                    type="password"
                                    className="My_input-box"
                                    placeholder="영어, 숫자 또는 특수문자 조합 20자 이내"
                                    onChange={handleNewPasswordChange}
                                    disabled={isEditingDisabled}
                                />
                            </div>
                            <div className="My_password-input">
                                <label className="My_password-label">새 비밀번호 확인</label>
                                <input
                                    type="password"
                                    className="My_input-box"
                                    placeholder="영어, 숫자 또는 특수문자 조합 20자 이내"
                                    onChange={handleConfirmPasswordChange}
                                    disabled={isEditingDisabled}
                                />
                                <button className="My_confirm-change-button" onClick={handleConfirmChange}>변경</button>
                            </div>
                            {passwordMatchMessage && (
                                <div
                                    className={`My_password-match-message ${
                                        isPasswordMatch ? "match" : "mismatch"
                                    }`}
                                >
                                    {passwordMatchMessage}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="My_label-wrapper">
                        <label className="My_label">이름</label>
                    </div>
                    <input
                        type="text"
                        className="My_info-item My_input-box"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <div className="My_label-wrapper">
                        <label className="My_label">전화번호</label>
                    </div>
                    <input
                        type="text"
                        className="My_info-item My_input-box"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>

                <div className="My_action-buttons">
                    <button className="My_modify-button">변경하기</button>
                    <button className="My_withdraw-button" onClick={openModal}>회원탈퇴</button>
                </div>
            </div>

            {isModalOpen && (
                <div className="My_modal-overlay">
                    <div className="My_modal-content">
                        <img src={trashIcon} alt="Trash Icon" className="My_trash-icon"/>
                        <h1>정말 탈퇴하시겠어요?</h1>
                        <p>탈퇴 버튼 선택 시 계정은 삭제되며 복구되지 않습니다</p>
                        <button className="My_modal-delete-button">탈퇴</button>
                        <button className="My_modal-cancel-button" onClick={closeModal}>취소</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default My;
