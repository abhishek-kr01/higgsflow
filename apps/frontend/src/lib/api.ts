import axios from "axios";
import { BACKEND_URL } from "@/config";

export const api = axios.create({
  baseURL: BACKEND_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("higgsflow_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function saveToken(token: string) {
  localStorage.setItem("higgsflow_token", token);
}

export function clearToken() {
  localStorage.removeItem("higgsflow_token");
}

export function hasToken() {
  return Boolean(localStorage.getItem("higgsflow_token"));
}
