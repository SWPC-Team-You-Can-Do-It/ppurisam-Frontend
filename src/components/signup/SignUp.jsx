import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginCheckIcon from "@/assets/images/login/check_circle.png";
import EyeIcon from "@/assets/images/login/Show.png"; // 패스워드 보기 아이콘 추가
import "./SignUp.css";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  // 가입하기 버튼 클릭 핸들러
  const handleSignup = () => {
    // 여기에서 회원가입 로직을 처리한 후 로그인 페이지로 이동
    navigate("/login");
  };

  return (
    <div className="container">
      <div className="headerBrand">Ppurisam</div>
      <div className="signupBox">
        <div className="brandWrapper">
          <div className="brandName">Ppurisam 회원가입</div>
        </div>
        <div className="inputWrapper">
          <label className="inputLabel">이름</label>
          <input
            type="text"
            className="textInput"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="inputWrapper">
          <label className="inputLabel">이메일</label>
          <input
            type="email"
            className="textInput"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="inputWrapper">
          <label className="inputLabel">비밀번호</label>
          <input
            type="password"
            className="textInput"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="inputWrapper">
          <label className="inputLabel">전화번호</label>
          <input
            type="text"
            className="textInput"
            placeholder="전화번호"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="buttonWrapper">
          <button className="signupButton" onClick={handleSignup}>
            가입하기
          </button>
        </div>
        <div className="backLinkWrapper">
          <a href="/login" className="backLink">
            돌아가기
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
