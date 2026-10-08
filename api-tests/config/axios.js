import axios from "axios";

export const createApi = (token = null) => {
  const api = axios.create({
    baseURL: "http://localhost:8080/api",
    timeout: 5000,
  });

  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  return api;
};
