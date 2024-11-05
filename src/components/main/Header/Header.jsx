// src/components/Header/Header.jsx

import React, { useContext } from "react";
import "./Header.css";
import loginIcon from "@/assets/images/Slider/mypage.png";
import { useNavigate, NavLink } from "react-router-dom";
import { AuthContext } from "../../login/AuthContext";

function Header() {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);

  const handleLogoClick = () => {
    navigate("/home");
  };

  const handleIconClick = () => {
    // 아이콘 클릭 시 원하는 동작 추가
    navigate("/");
  };

  const handleLogout = () => {
    // 토큰 제거
    localStorage.removeItem("token");

    // AuthContext 업데이트
    setAuth({
      access_token: null,
      isAuthenticated: false,
      error: null, // 필요에 따라 다른 상태도 초기화
    });

    // 로그인 페이지로 리디렉션
    navigate("/", { replace: true });
  };

  return (
    <header id="headerType" className="header__wrap noto">
      <div className="header__inner">
        <div className="header__logo" onClick={handleLogoClick}>
          PPURISAM
        </div>
        <nav className="header__menu">
          <ul>
            <li>
              <NavLink
                to="/send"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                문자보내기
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                주소록
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/tracking"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                발송조회
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/mypage"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                마이페이지
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="header__member">
          <button onClick={handleLogout} className="logoutButton">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
