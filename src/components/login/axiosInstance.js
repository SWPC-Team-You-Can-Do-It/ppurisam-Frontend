// src/components/login/axiosInstance.js

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
});

// Ppurio 토큰 발급 후 Local Storage에 저장하는 함수
function fetchAndStorePpurioToken() {
    axiosInstance.post("/api/ppurio/token")
        .then(response => {
            const ppurioToken = response.data.token; // TokenResponse에서 토큰 추출
            localStorage.setItem("ppurioToken", ppurioToken); // 토큰을 Local Storage에 저장
            console.log("Ppurio Token stored in localStorage:", ppurioToken);
        })
        .catch(error => {
            console.error("Failed to obtain Ppurio token", error);
        });
}

// 사용자의 로그인 후 호출하여 Ppurio 토큰을 받아 저장하도록 설정
// 예: 로그인 성공 후 호출
fetchAndStorePpurioToken();

axiosInstance.interceptors.request.use(
    (config) => {
        console.log("Interceptor start", config.url);

        // 로그인 요청 시 토큰 추가를 건너뜁니다.
        if (config.url === "/open-api/user/login") {
            return config;
        }

        // JWT 토큰 추가
        const token = localStorage.getItem("token");
        if (token && config.headers) {
            config.headers["Authorization"] = `Bearer ${token}`;
            console.log("Authorization header added");
        }

        // Ppurio 토큰 추가
        const ppurioToken = localStorage.getItem("ppurioToken");
        if (ppurioToken && config.headers) {
            config.headers["Authorization-Ppurio"] = ppurioToken;
            console.log("Authorization-Ppurio header added:", ppurioToken);
        }

        return config;
    },
    (error) => {
        console.log("Interceptor error:", error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response &&
            (error.response.status === 401 || error.response.status === 403)
        ) {
            localStorage.removeItem("token");
            localStorage.removeItem("ppurioToken");
            window.location.href =
                "/login?message=토큰이 만료되었습니다. 다시 로그인해주세요.";
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
