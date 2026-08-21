import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // required for httpOnly refresh cookies
});





export default api;

export const setToken = (token) => {
  document.cookie = `accessToken=${token}; path=/; max-age=3600; SameSite=Lax`;
};

export const removeToken = () => {
  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};




