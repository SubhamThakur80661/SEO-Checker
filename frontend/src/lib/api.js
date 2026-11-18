import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "https://seo-checker-2p81.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  timeout: 90000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getErrorMessage(err) {
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.code === "ECONNABORTED") return "The request timed out — the server may be waking up. Please try again.";
  if (err?.message === "Network Error") return "Could not reach the server. Check your connection and try again.";
  return err?.message || "Something went wrong.";
}

export default api;
