// src/components/Header/Header.jsx

import React from "react";
import "./Header.css";
import loginIcon from "@/assets/images/Slider/mypage.png";
import { useNavigate, NavLink } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleIconClick = () => {
    // 아이콘 클릭 시 원하는 동작 추가
    navigate("/login");
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
          <a onClick={() => navigate("/login")}>Logout</a>
        </div>
      </div>
    </header>
  );
}

export default Header;
