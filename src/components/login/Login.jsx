import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginCheckIcon from "@/assets/images/login/check_circle.png";
import EyeIcon from "@/assets/images/login/Show.png"; // 패스워드 보기 아이콘 추가
import "./Login.css";

const Login = () => {
  const [selectedButton, setSelectedButton] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const navigate = useNavigate();

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

  // 로그인 버튼 클릭 핸들러
  const handleContinue = () => {
    navigate("/");
  };

  return (
    <div className="container">
      <div className="headerBrand">Ppurisam</div>
      <div className="loginBox">
        <div className="brandWrapper">
          <div className="brandName">Ppurisam</div>
        </div>
        <div className="welcomeText">돌아온 걸 환영해요!</div>
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
          />
          {isEmailValid && (
            <img className="checkCircleIcon" src={LoginCheckIcon} alt="Valid" />
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
          />
          <img
            className="eyeIcon"
            src={EyeIcon}
            alt="Show Password"
            onClick={() => setShowPassword(!showPassword)}
          />
        </div>
        <div className="continueButtonWrapper">
          <button className="continueButton" onClick={handleContinue}>
            계속하기
          </button>
        </div>
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
