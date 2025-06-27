import axios from 'axios';

// API 베이스 URL
const API_BASE_URL = 'http://localhost:8080/api';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // 추후 JWT 토큰 추가
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    return response.data; // ApiResponse에서 data 부분만 반환
  },
  (error) => {
    if (error.response) {
      // 서버에서 반환한 에러
      const errorMessage = error.response.data?.message || '서버 오류가 발생했습니다.';
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // 네트워크 에러
      return Promise.reject(new Error('네트워크 연결을 확인해주세요.'));
    } else {
      // 기타 에러
      return Promise.reject(error);
    }
  }
);

// 일기 API
export const diaryAPI = {
  // 일기 작성
  createDiary: async (diaryData) => {
    const response = await api.post('/diaries', diaryData);
    return response.data;
  },

  // 특정 날짜 일기 조회
  getDiary: async (date) => {
    const response = await api.get(`/diaries/${date}`);
    return response.data;
  },

  // 일기 목록 조회
  getDiaryList: async () => {
    const response = await api.get('/diaries');
    return response.data;
  },

  // 일기 수정
  updateDiary: async (date, diaryData) => {
    const response = await api.put(`/diaries/${date}`, diaryData);
    return response.data;
  },

  // 일기 삭제
  deleteDiary: async (date) => {
    const response = await api.delete(`/diaries/${date}`);
    return response.data;
  },

  // 일기 검색
  searchDiaries: async (keyword) => {
    const response = await api.get(`/diaries/search?keyword=${encodeURIComponent(keyword)}`);
    return response.data;
  },

  // 감정별 일기 조회
  getDiariesByEmotion: async (emotion) => {
    const response = await api.get(`/diaries/emotion/${emotion}`);
    return response.data;
  },

  // 작성 가능 시간 체크
  checkWritableTime: async () => {
    const response = await api.get('/diaries/writable-time');
    return response.data;
  },

  // 특정 날짜 일기 존재 여부
  checkDiaryExists: async (date) => {
    const response = await api.get(`/diaries/exists/${date}`);
    return response.data;
  },
};

// 시스템 API
export const systemAPI = {
  // 헬스 체크
  health: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
