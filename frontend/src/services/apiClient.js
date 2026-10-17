import axios from "axios";

let accessToken = null;
let refreshRequest = null;

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status !== 401
      || !originalRequest
      || originalRequest._retry
      || originalRequest.url?.startsWith("/auth/")) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      refreshRequest ??= axios.post("/auth/refresh", {}, {
        baseURL: apiClient.defaults.baseURL,
        withCredentials: true,
      }).then(({ data }) => {
        accessToken = data.accessToken;
        return data.accessToken;
      }).finally(() => {
        refreshRequest = null;
      });

      const token = await refreshRequest;
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      accessToken = null;
      return Promise.reject(refreshError);
    }
  },
);

export function setAccessToken(token) {
  accessToken = token;
}

export default apiClient;