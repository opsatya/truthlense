import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 25000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.data?.detail) {
      const d = err.response.data.detail;
      const msg = Array.isArray(d) ? d.map((x) => x.msg).join(', ') : String(d);
      return Promise.reject(new Error(msg));
    }
    if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
      return Promise.reject(new Error('Cannot connect to backend. Make sure FastAPI is running on port 8000.'));
    }
    return Promise.reject(err);
  }
);

export const analyzeNewsText = async (newsText) => {
  const res = await apiClient.post('/predict', { text: newsText });
  return res.data;
};

export const analyzeNewsUrl = async (url) => {
  const res = await apiClient.post('/analyze-url', { url });
  return res.data;
};

export const getDashboardStats = async () => {
  const res = await apiClient.get('/dashboard');
  return res.data;
};

export default apiClient;
