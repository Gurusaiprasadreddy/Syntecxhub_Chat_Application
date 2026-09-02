import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getRooms = () => api.get('/rooms');
export const createRoom = (data) => api.post('/rooms', data);
export const getRoom = (roomId) => api.get(`/rooms/${roomId}`);
export const joinRoom = (roomId) => api.post(`/rooms/${roomId}/join`);
export const leaveRoom = (roomId) => api.post(`/rooms/${roomId}/leave`);
export const deleteRoom = (roomId) => api.delete(`/rooms/${roomId}`);

export default api;
