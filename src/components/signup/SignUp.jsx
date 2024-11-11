import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../login/axiosInstance";
import LoginCheckIcon from "@/assets/images/login/check_circle.png";
import EyeIcon from "@/assets/images/login/Show.png"; // 패스워드 보기 아이콘 추가
import "./SignUp.css";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const [error, setError] = useState(""); // 오류 메시지 상태 추가
  const navigate = useNavigate();

  // 가입하기 버튼 클릭 핸들러
  const handleSignup = async (e) => {
    e.preventDefault(); // 기본 폼 제출 방지
    setLoading(true);
    setError("");

    // 사용자 입력 데이터
    const userData = {
      name,
      email,
      password,
      phone_number: phone, // 백엔드에서 요구하는 필드명과 일치
    };

    console.log("Sending userData:", userData);

    try {
      const response = await axiosInstance.post(
        "/open-api/user/register",
        userData
      );
      console.log("회원가입 성공:", response.data);
      // 성공 메시지 표시 또는 다른 로직 추가 가능
      navigate("/login"); // 로그인 페이지로 이동
    } catch (err) {
      console.error("회원가입 오류:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="headerBrand">Ppurisam</div>
      <div className="signupBox">
        <div className="brandWrapper">
          <div className="brandName">Ppurisam 회원가입</div>
        </div>
        <form onSubmit={handleSignup}>
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
          {error && <div className="errorMessage">{error}</div>}
          <div className="buttonWrapper">
            <button type="submit" className="signupButton" disabled={loading}>
              {loading ? "가입 중..." : "가입하기"}
            </button>
          </div>
        </form>
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
