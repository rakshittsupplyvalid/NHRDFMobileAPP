// Service/apiClient.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ----------------------- AsyncStorage Helpers -----------------------

// Store token
export const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem('userToken', token);
  } catch (err) {
    console.log('Error storing token:', err);
  }
};

// Retrieve token
export const retrieveToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return token || null;
  } catch (err) {
    console.log('Error retrieving token:', err);
    return null;
  }
};

// Remove token (logout)
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('userToken');
  } catch (err) {
    console.log('Error removing token:', err);
  }
};

// ----------------------- Axios Instance -----------------------
const apiClient = axios.create({
  baseURL: 'https://dev-nhrdf-backend.supplyvalid.com',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

});

// ----------------------- Request Interceptor -----------------------
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await retrieveToken();
    
        
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Handle FormData
      if (config.data instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
      } else if (config.data) {
        config.headers['Content-Type'] = 'application/json';
      }

      return config;
    } catch (err) {
      console.log('Request Interceptor Error:', err);
      return config;
    }
  },
  (error) => {
    console.log('Request Error:', error);
    return Promise.reject(error);
  }
);

// ----------------------- Response Interceptor -----------------------
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.log('API Response Error:', error.response.data);
    } else if (error.request) {
      console.log('No Response:', error.request);
    } else {
      console.log('Axios Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;




