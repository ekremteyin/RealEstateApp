
import axios from "axios";


const ROOT = (import.meta.env?.VITE_API_BASE_URL || "").replace(/\/+$/, "");


export const API_BASE = ROOT ? `${ROOT}/api` : "/api";

const api = axios.create({
  baseURL: API_BASE,
});

// isteklere token ekler
api.interceptors.request.use((config) => {
  const t = localStorage.getItem("token");
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export default api;
