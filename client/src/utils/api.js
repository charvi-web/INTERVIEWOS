import axios from "axios";

// Base URL — ek jagah se change karo
// Development mein localhost — production mein deployed URL
const BASE_URL = "http://localhost:5000/api";

// Axios instance banao
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  // withCredentials — cookies automatically bhejo
  // refresh token cookie ke liye zaroori
});

// Request Interceptor — har request se pehle chalta hai
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // har request mein automatically token lagao
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor — har response ke baad chalta hai
api.interceptors.response.use(
  (response) => response,
  // success — as it is return karo

  async (error) => {
    const originalRequest = error.config;

    // 401 — token expire hua
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // _retry — infinite loop rokta hai

      try {
        // Refresh token se naya access token lo
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = data.data.accessToken;
        localStorage.setItem("accessToken", newToken);
        // naya token save karo

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        // original request dobara bhejo naye token ke saath
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh token bhi expire — logout karo
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;