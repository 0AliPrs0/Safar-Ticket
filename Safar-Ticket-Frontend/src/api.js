import axios from "axios";
import { ACCESS_TOKEN } from "./constants";
import i18n from "./i18n"; // Import i18n instance

const defaultApiUrl = "http://localhost:8000";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add the current language to every request header
    config.headers['Accept-Language'] = i18n.language;
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;