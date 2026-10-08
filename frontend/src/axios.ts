import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =====================
// JWT utils
// =====================

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp;

    if (!exp) return true;

    return exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// =====================
// Init from localStorage
// =====================

(() => {
  const token = localStorage.getItem("token");

  if (!token) return;

  if (isTokenExpired(token)) {
    localStorage.removeItem("token");
    return;
  }

  instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
})();

export const initAuthToken = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    delete instance.defaults.headers.common["Authorization"];
    return null;
  }

  if (isTokenExpired(token)) {
    localStorage.removeItem("token");
    delete instance.defaults.headers.common["Authorization"];
    return null;
  }

  instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  return token;
};

// =====================
// Token API
// =====================

initAuthToken();

export const setAuthToken = (token: string) => {
  console.log(token);
  localStorage.setItem("token", token);
  instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export const removeAuthToken = () => {
  localStorage.removeItem("token");
  delete instance.defaults.headers.common["Authorization"];
};

export default instance;
