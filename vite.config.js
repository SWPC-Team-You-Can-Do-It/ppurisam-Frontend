import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true, // 도커 환경에서 서버를 외부에서 접근할 수 있게 설정
    port: 3000, // 포트 3000 설정
    watch: {
      usePolling: true, // 도커 파일 시스템 변경 감지를 위한 설정
    },
  },
  plugins: [react()],
});
