// src/components/login/Login.js
import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LoginCheckIcon from "@/assets/images/login/check_circle.png";
import EyeIcon from "@/assets/images/login/Show.png"; // 패스워드 보기 아이콘 추가
import "./Login.css";
import axiosInstance from "./axiosInstance"; // 설정한 Axios 인스턴스 가져오기
import { AuthContext } from "./AuthContext"; // AuthContext 가져오기

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState(""); // 비밀번호 상태
  const [error, setError] = useState(""); // 오류 메시지 상태
  const [loading, setLoading] = useState(false); // 로딩 상태
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, setAuth } = useContext(AuthContext); // AuthContext 사용

  // 이미 인증된 사용자는 메인페이지로 리디렉션
  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate("/home");
    }
  }, [auth.isAuthenticated, navigate]);

  useEffect(() => {
    // 로그인 페이지로 리디렉션된 경우 메시지 표시
    if (location.state && location.state.message) {
      setError(location.state.message);
    }
    // URL 쿼리 파라미터로 전달된 메시지 처리
    const params = new URLSearchParams(location.search);
    const message = params.get("message");
    if (message) {
      setError(message);
    }
  }, [location]);

  // 이메일 유효성 검사 함수
  const validateEmail = (email) => {
    // 간단한 정규 표현식으로 이메일 형식 검사
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // 이메일 입력 핸들러
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setIsEmailValid(validateEmail(value));
  };

  // 이메일 입력 포커스 아웃 핸들러
  const handleEmailBlur = () => {
    setEmailTouched(true);
  };

  // 비밀번호 입력 핸들러
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // 로그인 버튼 클릭 핸들러
  const handleContinue = async (e) => {
    e.preventDefault();
    setError("");

    if (!isEmailValid) {
      setError("유효한 이메일을 입력하세요.");
      return;
    }
    if (!password) {
      setError("비밀번호를 입력하세요.");
      return;
    }

    setLoading(true);

    try {
      // 로그인 요청
      const response = await axiosInstance.post(`/open-api/user/login`, {
        email,
        password,
      });

      const { access_token } = response.data;

      // 토큰을 로컬 스토리지에 저장
      localStorage.setItem("token", access_token);

      // AuthContext 업데이트
      setAuth((prev) => ({
        ...prev,
        access_token,
        isAuthenticated: true,
      }));

      // 뿌리오 토큰 요청
      try {
        const ppurioResponse = await axiosInstance.post(`/api/ppurio/token`);

        const ppurioToken = ppurioResponse.data.token; // 토큰 필드명은 실제 응답에 따라 수정 필요

        // 뿌리오 토큰을 로컬 스토리지에 저장
        localStorage.setItem("ppurio_token", ppurioToken);

        // AuthContext 업데이트
        setAuth((prev) => ({
          ...prev,
          ppurio_token: ppurioToken,
        }));

        // 메인 페이지로 리디렉션
        navigate("/home");
      } catch (ppurioError) {
        console.error("Ppurio token error:", ppurioError);
        setError("Ppurio 토큰을 가져오는 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message === "Network Error") {
        setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
      } else {
        setError("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="headerBrand">Ppurisam</div>
      <div className="loginBox">
        <div className="brandWrapper">
          <div className="brandName">Ppurisam</div>
        </div>
        <div className="welcomeText">돌아온 걸 환영해요!</div>
        <form onSubmit={handleContinue}>
          <div className="inputWrapper">
            <input
              type="email"
              className={`emailInput ${
                emailTouched && !isEmailValid ? "invalid" : ""
              }`}
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              required
            />
            {isEmailValid && (
              <img
                className="checkCircleIcon"
                src={LoginCheckIcon}
                alt="Valid"
              />
            )}
          </div>
          {emailTouched && !isEmailValid && (
            <div className="errorText">유효한 이메일을 입력하세요.</div>
          )}
          <div className="inputWrapper">
            <input
              type={showPassword ? "text" : "password"}
              className="passwordInput"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            <img
              className="eyeIcon"
              src={EyeIcon}
              alt="Show Password"
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>
          <div className="continueButtonWrapper">
            <button type="submit" className="continueButton" disabled={loading}>
              {loading ? "로딩 중..." : "계속하기"}
            </button>
          </div>
        </form>
        {error && <div className="errorText">{error}</div>}
        <div className="signupLinkWrapper">
          <a href="/signup" className="signupLink">
            회원가입
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
