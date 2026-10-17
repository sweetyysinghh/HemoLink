import apiClient, { setAccessToken } from "./apiClient";

function applyAuthResponse(response) {
  const { accessToken, user } = response.data;
  setAccessToken(accessToken);
  return user;
}

export async function login(credentials) {
  const response = await apiClient.post("/auth/login", credentials);
  return applyAuthResponse(response);
}

export async function register(details) {
  const response = await apiClient.post("/auth/register", details);
  return applyAuthResponse(response);
}

export async function refreshSession() {
  const response = await apiClient.post("/auth/refresh");
  return applyAuthResponse(response);
}

export async function logout() {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    setAccessToken(null);
  }
}

export function requestPasswordReset(email) {
  return apiClient.post("/auth/forgot-password", { email });
}

export function resetPassword(token, newPassword) {
  return apiClient.post("/auth/reset-password", { token, newPassword });
}
