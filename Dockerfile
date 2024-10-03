# Node.js 이미지 사용
FROM node:20.17.0

# 작업 디렉터리 설정
WORKDIR /app

# 패키지 파일 복사
COPY package.json ./
COPY package-lock.json ./

# 종속성 설치
RUN npm install

# 앱 소스 복사
COPY . .

# React 개발 서버 실행
CMD ["npm", "start"]

# 애플리케이션이 3000번 포트를 사용함
EXPOSE 3000