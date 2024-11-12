// My.jsx
import React, { useState, useEffect } from "react";
import "./My.css";
import trashIcon from "@/assets/images/My/Trash.png";
import axiosInstance from "../login/axiosInstance";
import { useNavigate } from "react-router-dom";

const My = () => {
  const [isPasswordChangeVisible, setPasswordChangeVisible] = useState(false);
  const [isEditingDisabled, setIsEditingDisabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatchMessage, setPasswordMatchMessage] = useState("");
  const [isPasswordMatch, setIsPasswordMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get("/api/user");
        const user = response.data;
        setName(user.name);
        setPhone(user.phone_number);
        setEmail(user.email);
      } catch (err) {
        console.error("사용자 정보 조회 오류:", err);
        setError("사용자 정보를 가져오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

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

  const handleCurrentPasswordChange = (e) => {
    setCurrentPassword(e.target.value);
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

  const handleConfirmChange = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (isPasswordChangeVisible && !currentPassword) {
      setError("현재 비밀번호를 입력해주세요.");
      return;
    }

    setIsEditingDisabled(true);
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const updateData = {
        name,
        phone,
        email,
      };

      if (isPasswordChangeVisible) {
        updateData.currentPassword = currentPassword;
        if (newPassword) {
          updateData.password = newPassword;
        }
      }

      const response = await axiosInstance.patch("/api/user", updateData);
      const updatedUser = response.data;

      setSuccessMessage("사용자 정보가 성공적으로 업데이트되었습니다.");
      setPasswordChangeVisible(false);
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
      setPasswordMatchMessage("");
      setIsPasswordMatch(null);
    } catch (err) {
      console.error("사용자 정보 수정 오류:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("사용자 정보를 수정하는 데 실패했습니다.");
      }
    } finally {
      setIsEditingDisabled(false);
      setIsLoading(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    setError("");
    try {
      await axiosInstance.delete("/api/user");
      localStorage.removeItem("token");
      // 로그아웃 처리 또는 리디렉션
      navigate.push("/login"); // 탈퇴 후 이동
    } catch (err) {
      console.error("회원 탈퇴 오류:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("회원 탈퇴에 실패했습니다.");
      }
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="My_container">
      <div className="My_description">
        * 회원님의 정보를 변경할 수 있습니다.
      </div>

      <div className="My_content-wrapper">
        <div className="My_main-title">내 계정 관리</div>

        {isLoading && <div className="My_loading">로딩 중...</div>}
        {error && <div className="My_error-message">{error}</div>}
        {successMessage && (
          <div className="My_success-message">{successMessage}</div>
        )}

        <div className="My_info-section">
          <div className="My_label-wrapper">
            <label className="My_label">이메일</label>
          </div>

          <div className="My_info-item">
            {email ? (
              <div>{email}</div>
            ) : (
              <div className="My_loading">이메일을 가져오는 중...</div>
            )}
          </div>

          <div className="My_info-item My_info-password">
            <div className="My_label-wrapper">
              <label className="My_label">비밀번호</label>
            </div>
            <button
              className="My_change-password-button"
              onClick={togglePasswordChange}
              disabled={isLoading}
            >
              {isPasswordChangeVisible ? "비밀번호 변경 취소" : "비밀번호 변경"}
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
                  value={currentPassword}
                  onChange={handleCurrentPasswordChange}
                  disabled={isEditingDisabled}
                />
              </div>
              <div className="My_password-input">
                <label className="My_password-label">새 비밀번호</label>
                <input
                  type="password"
                  className="My_input-box"
                  placeholder="영어, 숫자 또는 특수문자 조합 20자 이내"
                  value={newPassword}
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
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  disabled={isEditingDisabled}
                />
                <button
                  className="My_confirm-change-button"
                  onClick={handleConfirmChange}
                  disabled={
                    isEditingDisabled ||
                    isLoading ||
                    (newPassword && newPassword !== confirmPassword)
                  }
                >
                  변경
                </button>
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
            disabled={isEditingDisabled || isLoading}
          />

          <div className="My_label-wrapper">
            <label className="My_label">전화번호</label>
          </div>
          <input
            type="text"
            className="My_info-item My_input-box"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isEditingDisabled || isLoading}
          />
        </div>

        <div className="My_action-buttons">
          <button
            className="My_modify-button"
            onClick={handleConfirmChange}
            disabled={
              isEditingDisabled ||
              isLoading ||
              (isPasswordChangeVisible && !currentPassword)
            }
          >
            변경하기
          </button>
          <button
            className="My_withdraw-button"
            onClick={openModal}
            disabled={isLoading}
          >
            회원탈퇴
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="My_modal-overlay" onClick={closeModal}>
          <div
            className="My_modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={trashIcon} alt="Trash Icon" className="My_trash-icon" />
            <h1>정말 탈퇴하시겠어요?</h1>
            <p>탈퇴 버튼 선택 시 계정은 삭제되며 복구되지 않습니다</p>
            <button
              className="My_modal-delete-button"
              onClick={handleDeleteAccount}
              disabled={isLoading}
            >
              탈퇴
            </button>
            <button
              className="My_modal-cancel-button"
              onClick={closeModal}
              disabled={isLoading}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default My;
