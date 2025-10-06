

import axios from 'axios';
import { retrieveToken } from '../utils/authUtils';

const apiClient = axios.create({
  baseURL: 'https://dev-nhrdf-backend.supplyvalid.com',
  headers: {
    'Content-Type': 'application/json',
    'accept': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await retrieveToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Agar FormData hai to multipart set kar do
  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
    return config;
  }

  return config;
});

// Response interceptor (direct return, no decryption)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default apiClient;
