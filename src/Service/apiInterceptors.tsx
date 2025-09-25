// import axios from 'axios';
// import jscrypto from '../utils/jscrypto';
// import { retrieveToken } from '../utils/authUtils';

// const apiClient = axios.create({
//   baseURL: 'https://dev-nhrdf-backend.supplyvalid.com',
//   headers: {
//     'Content-Type': 'application/octet-stream',
//     'isencrypted': 'true',
//     'accept': 'text/plain',
//   },
// });

// apiClient.interceptors.request.use(async (config) => {
//   const token = await retrieveToken(); 

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   const fullUrl = `${config.baseURL?.replace(/\/$/, '')}${config.url}`;

//   if (config.data instanceof FormData) {
//     config.headers['Content-Type'] = 'multipart/form-data';
//     config.headers['Original-Content'] = 'multipart/form-data';
//     config.headers['isencrypted'] = 'true';
//     return config;
//   }

//   if (config.data) {
//     const rawData = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
//     const [encryptedData, contentType] = await jscrypto.encryptRequest(rawData);

//     config.data = encryptedData;
//     config.headers['Content-Type'] = 'application/octet-stream';
//     config.headers['Original-Content'] = contentType || 'application/json';
//     config.headers['isencrypted'] = 'true';
//   }

//   return config;
// });

// // 🔓 Response interceptor
// apiClient.interceptors.response.use(
//   async (response) => {
//     const isEncrypted = response?.headers?.['isencrypted'] == 'True' || response?.headers?.['isencrypted'] == 'true';
//     const originalContent = response?.headers?.['original-content'] || 'application/json';

//     if (!isEncrypted) return response;

//     try {
//       const decryptedRes = await jscrypto.decryptResponse(response.data);
//       response.data = decryptedRes;
//     } catch (err) {
//       console.error('Decryption error:', err);
//       return Promise.reject(err);
//     }

//     return response;
//   },
//   (error) => Promise.reject(error)
// );

// export default apiClient;



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
