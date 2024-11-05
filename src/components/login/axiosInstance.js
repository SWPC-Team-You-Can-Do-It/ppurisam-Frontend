import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    console.log("Interceptor start", config.url);

    if (config.url === "/open-api/user/login") {
      return config;
    }

    const token = localStorage.getItem("token");

    if (token && config.headers) {
      config.headers["authorization-token"] = `Bearer ${token}`;
      console.log("authorization-token header added");
    }

    console.log("Final headers:", config.headers);
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
      window.location.href =
        "/login?message=토큰이 만료되었습니다. 다시 로그인해주세요.";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
