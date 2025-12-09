import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8001",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 상세한 오류 로깅
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code,
    });
    
    if (error.code === "ECONNABORTED" || error.message === "Network Error" || !error.response) {
      const baseURL = error.config?.baseURL || api.defaults.baseURL;
      error.message = `서버에 연결할 수 없습니다. 백엔드 서버(${baseURL})가 실행 중인지 확인해주세요.`;
    }
    return Promise.reject(error);
  }
);

export default api;

