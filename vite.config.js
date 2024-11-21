import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0", // 도커 환경에서 서버를 외부에서 접근할 수 있게 설정
    port: 3000, // 포트 3000 설정
    hmr: {
      host: "localhost",
      port: 3000,
      protocaol: "ws",
    },
    watch: {
      usePolling: true, // 도커 파일 시스템 변경 감지를 위한 설정
    },
    proxy: {
      "/api": {
        // 프론트엔드에서 /api로 시작하는 요청을 백엔드로 프록시
        target: "http://backend:8080", // Docker Compose에서 정의한 백엔드 서비스 이름과 포트
        changeOrigin: true,
        secure: false,
        // 필요 시 경로 재작성 (예: /api/users -> /users)
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // 별칭 설정
    },
  },
});
